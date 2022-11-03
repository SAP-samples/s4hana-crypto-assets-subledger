build-srv:
	docker build --platform amd64 -t alunde/rates-srv:latest -f srv/Dockerfile .
build-app:
	docker build --platform amd64 -t alunde/rates-app:latest -f app/Dockerfile .

docker-push: build-srv build-app
	docker push alunde/rates-srv:latest
	docker push alunde/rates-app:latest

helm-deploy:
	helm upgrade -n dev -i rates-srv helm/rates-srv --install
	helm upgrade -n dev -i rates-app helm/rates-app --install

helm-undeploy:
	helm uninstall -n dev rates-app
	helm uninstall -n dev rates-srv
