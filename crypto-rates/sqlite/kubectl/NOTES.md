```
kubectl config set-context --current --namespace=dev
kubectl get pods 
```
Run this to create the Persistent Volume Claim BEFORE doing a helm-deploy
```
kubectl apply -f sqlite/kubectl/pvc.yaml
```
Shell into the running sqlite pod
```
export PNAME="crypto-rates-sqlite" ; export POD=$(kubectl get pods | grep $PNAME | cut -d ' ' -f 1) ; echo 'Bash Prompt in '$POD ; kubectl exec pod/$POD --container $PNAME -n dev -it -- bash
```
Once at the prompt you can explore the database
```
sqlite3 data/a-test.db
.tables // list tables
.headers on // display column names
.mode csv // maybe use csv format
select * from tenant // show 
.quit // to exit sqlite3
exit // exit from bash shell
```

Watch the logs of the various pods
```
export POD=$(kubectl get pods | grep crypto-rates-srv | cut -d ' ' -f 1) ; echo $POD ; kubectl logs $POD --tail 100 --follow

export POD=$(kubectl get pods | grep crypto-rates-sqlite | cut -d ' ' -f 1) ; echo $POD ; kubectl logs $POD --tail 100 --follow

export POD=$(kubectl get pods | grep crypto-rates-app | cut -d ' ' -f 1) ; echo $POD ; kubectl logs $POD --tail 100 --follow
```

Kyma Alter DEST configmap

```
DEST=$(kubectl get configmap crypto-rates-app -o json | jq '.data.destinations | fromjson') ; echo $DEST
DESTX=$(echo $DEST | jq '(.[] | select(.name == "sqlite") | .url) |= "http://70.251.209.207:8004/" | tostring') ; echo $DESTX | jq '.'

DEST=$(kubectl get configmap crypto-rates-app -o json | jq '.data.destinations | fromjson') ; echo $DEST
DESTX=$(echo $DEST | jq '(.[] | select(.name == "sqlite") | .url) |= "http://70.251.209.207:8004/"') ; echo $DESTX | jq '.' 
// Paste into Kyma yaml editor...

kubectl get configmap crypto-rates-app -o json | jq --argjson dests "$DESTX" '.data.destinations = $dests'   |  kubectl apply -f -

// sooo close...

kubectl get configmap crypto-rates-app -o json | jq --arg dests "$DESTX" '.data.destinations = $dests'   |  kubectl apply -f -
```
