build-srv:
	docker build --platform amd64 -t alunde/crypto-rates-srv:latest -f srv/Dockerfile .
build-sqlite:
	docker build --platform amd64 -t alunde/crypto-rates-sqlite:latest -f sqlite/Dockerfile .
build-app:
	docker build --platform amd64 -t alunde/crypto-rates-app:latest -f app/Dockerfile .

rebuild-app:
	docker build --platform amd64 -t alunde/crypto-rates-app:latest -f app/Dockerfile . ; docker push alunde/crypto-rates-app:latest

docker-push: build-srv build-sqlite build-app
	docker push alunde/crypto-rates-srv:latest
	docker push alunde/crypto-rates-sqlite:latest
	docker push alunde/crypto-rates-app:latest

helm-deploy:
	helm upgrade -n dev -i crypto-rates-srv helm/crypto-rates-srv --install
	helm upgrade -n dev -i crypto-rates-sqlite helm/crypto-rates-sqlite --install
	helm upgrade -n dev -i crypto-rates-app helm/crypto-rates-app --install

helm-undeploy:
	helm uninstall -n dev crypto-rates-app
	helm uninstall -n dev crypto-rates-sqlite
	helm uninstall -n dev crypto-rates-srv
