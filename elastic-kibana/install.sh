#!/bin/bash

baseip="this.server.ip.address"
apt-get update;
DEBIAN_FRONTEND='noninteractive' apt-get -y -o Dpkg::Options::='--force-confdef' -o Dpkg::Options::='--force-confold' dist-upgrade
apt-get install -y vim curl zip jq gnupg gpg git;

wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/9.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-9.x.list
apt-get update;
apt-get install -y apt-transport-https;
apt-get install -y elasticsearch kibana;

echo 'cluster.name: es-demo' >> /etc/elasticsearch/elasticsearch.yml
echo 'network.host: 0.0.0.0' >> /etc/elasticsearch/elasticsearch.yml
systemctl enable elasticsearch;
systemctl start elasticsearch;


echo 'server.host: "0.0.0.0"' >> /etc/kibana/kibana.yml
echo 'server.publicBaseUrl: "https://'$baseip':5601/"' >> /etc/kibana/kibana.yml
echo 'server.ssl.key: "/etc/kibana/certs/kibana.key"' >> /etc/kibana/kibana.yml
echo 'server.ssl.certificate: "/etc/kibana/certs/kibana.crt"' >> /etc/kibana/kibana.yml
echo 'server.ssl.certificateAuthorities: ["/etc/kibana/certs/http_ca.crt"]' >> /etc/kibana/kibana.yml
echo 'server.ssl.enabled: true' >> /etc/kibana/kibana.yml
echo 'xpack.encryptedSavedObjects.encryptionKey: "123456789012345678901234567890ABCDEFGH"' >> /etc/kibana/kibana.yml

/usr/share/elasticsearch/bin/elasticsearch-keystore show xpack.security.http.ssl.keystore.secure_password \
  | openssl pkcs12 \
      -in /etc/elasticsearch/certs/http.p12 \
      -nodes \
      -nocerts \
      -out /etc/elasticsearch/certs/http_ca.key \
      -passin stdin

/usr/share/elasticsearch/bin/elasticsearch-certutil cert \
  --out /etc/kibana/kibana.zip \
  --name kibana \
  --ca-cert /etc/elasticsearch/certs/http_ca.crt \
  --ca-key /etc/elasticsearch/certs/http_ca.key \
  --ip $baseip \
  --pem;
cd /etc/kibana/;
unzip kibana.zip
mv kibana certs
cp /etc/elasticsearch/certs/http_ca.crt  /etc/kibana/certs/
chown -R kibana:kibana /etc/kibana

systemctl enable kibana;
systemctl start kibana;

