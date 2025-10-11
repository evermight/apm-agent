from elasticapm.contrib.flask import ElasticAPM
from flask import Flask
import elasticapm
import time

# Initialize Flask app
app = Flask(__name__)

# Configure Elastic APM
app.config['ELASTIC_APM'] = {
    # Allowed characters: a-z, A-Z, 0-9, -, _, and space
    'SERVICE_NAME': 'python-app-1',
    # Use if APM Server requires a secret token
    'SECRET_TOKEN': 'abcd1234',
    'SERVER_URL': 'http://localhost:8200',
    # 'VERIFY_SERVER_CERT': True,
    # 'ENVIRONMENT': 'production'
}

# Initialize APM
apm = ElasticAPM(app)

# Get the APM client for manual instrumentation
apm_client = elasticapm.get_client()

# Routes
@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/error/automatic')
def error_automatic():
    # Bad code generates error
    return non_declared_variable

@app.route('/error/manual/<params1>')
def error_manual(params1):
    msg = f'Manual Error: {params1}'
    
    response = msg
    try:
        x = int(msg)
    except ValueError:
        apm.capture_exception()
    
    return response

@app.route('/span/<params1>')
def span_route(params1):
    timeout = 5.0  # 5 seconds
    msg = f'Testing a span, will wait {int(timeout * 1000)}ms'
    with elasticapm.capture_span(msg):
        time.sleep(timeout)
    # send_metadata(msg)
    return 'Testing Span'

@app.route('/metadata/<params1>')
def metadata_route(params1):
    send_metadata(params1)
    return f'Metadata: {params1}'

@app.route('/transaction-name/<params1>')
def transaction_name_route(params1):
    elasticapm.set_transaction_name(f'Path: /transaction-name/{params1}')
    return f'Transaction Name: {params1}'

def send_metadata(msg):
    elasticapm.label(MyLabel=msg)
    
    elasticapm.set_user_context(
        user_id=msg,
        username=msg,
        email=f'{msg}@{msg}.com'
    )
    
    elasticapm.set_custom_context({
        'MyObject': {
            'MyCustomContextMessage': msg
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3030, debug=False)
