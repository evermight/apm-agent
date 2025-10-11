package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"go.elastic.co/apm/module/apmhttp/v2"
	"go.elastic.co/apm/v2"
)

func main() {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	router := mux.NewRouter()

	router.HandleFunc("/", handleRoot).Methods("GET")
	router.HandleFunc("/error/automatic", handleErrorAutomatic).Methods("GET")
	router.HandleFunc("/error/manual/{params1}", handleErrorManual).Methods("GET")
	router.HandleFunc("/span/{params1}", handleSpan).Methods("GET")
	router.HandleFunc("/metadata/{params1}", handleMetadata).Methods("GET")
	router.HandleFunc("/transaction-name/{params1}", handleTransactionName).Methods("GET")

	// Wrap with APM middleware
	handler := apmhttp.Wrap(router)

	// Get port from environment or default to 3030
	port := os.Getenv("WEB_PORT")
	if port == "" {
		port = "3030"
	}

	// Start server
	log.Printf("Listening on port %s\n", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, handler))
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello World!")
}

func handleErrorAutomatic(w http.ResponseWriter, r *http.Request) {
	// Bad code generates error - this will panic and be caught by APM
	var slice []string
	fmt.Fprint(w, slice[10])
}

func handleErrorManual(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	params1 := vars["params1"]

	msg := fmt.Sprintf("Manual Error: %s", params1)
	fmt.Fprint(w, msg)

	err := errors.New(msg)
	apm.CaptureError(r.Context(), err).Send()
}

func handleSpan(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	params1 := vars["params1"]

	fmt.Fprint(w, "Testing Span: " + params1)

	timeout := 5000 * time.Millisecond
	msg := fmt.Sprintf("Testing a span, will wait %dms", 5000)
	span, _ := apm.StartSpan(r.Context(), msg, "custom")
	time.Sleep(timeout)
	span.End()
	// sendMetaData(r, msg)
	_ = params1
}

func handleMetadata(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	params1 := vars["params1"]

	fmt.Fprintf(w, "Metadata: %s", params1)
	sendMetaData(r, params1)
}

func handleTransactionName(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	params1 := vars["params1"]

	fmt.Fprintf(w, "Transaction Name: %s", params1)
	tx := apm.TransactionFromContext(r.Context())
	if tx != nil {
		tx.Name = fmt.Sprintf("Path: /transaction-name/%s", params1)
	}
}

func sendMetaData(r *http.Request, msg string) {
	tx := apm.TransactionFromContext(r.Context())
	if tx == nil {
		return
	}
	tx.Context.SetLabel("MyLabel", msg)
	tx.Context.SetUsername(msg)
	tx.Context.SetUserID(msg)
	tx.Context.SetUserEmail(fmt.Sprintf("%s@%s.com", msg, msg))
	tx.Context.SetCustom("MyObject", map[string]interface{}{
		"MyCustomContextMessage": msg,
	})
}
