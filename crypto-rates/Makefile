build-srv:
	docker build --platform amd64 -t alunde/crypto-rates-srv:latest -f srv/Dockerfile .
build-srvjs:
	docker build --platform amd64 -t alunde/crypto-rates-srvjs:latest -f srvjs/Dockerfile .
build-app:
	docker build --platform amd64 -t alunde/crypto-rates-app:latest -f app/Dockerfile .

docker-push: build-srv build-srvjs build-app
	docker push alunde/crypto-rates-srv:latest
	docker push alunde/crypto-rates-srvjs:latest
	docker push alunde/crypto-rates-app:latest

helm-deploy:
	helm upgrade -n dev -i crypto-rates-srv helm/crypto-rates-srv --install
	helm upgrade -n dev -i crypto-rates-srvjs helm/crypto-rates-srvjs --install
	helm upgrade -n dev -i crypto-rates-app helm/crypto-rates-app --install

helm-undeploy:
	helm uninstall -n dev crypto-rates-app
	helm uninstall -n dev crypto-rates-srvjs
	helm uninstall -n dev crypto-rates-srv
