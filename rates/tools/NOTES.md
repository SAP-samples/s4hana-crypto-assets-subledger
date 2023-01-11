Run Cleanup from tmp
```
rm -f Makefile.modx ; \
rm -rf app ; \
rm -rf helm ; \
rm -rf helm-common ; \
rm -rf modx
```
Run Cleanup from top
```
rm -f Makefile.modx ; \
rm -f app/resources/index.html.modx ; \
rm -f app/xs-app.json.modx ; \
rm -rf helm/modx ; \
rm -f helm/rates-app/templates/configmap.yaml.modx ; \
rm -f helm-common/values.yaml.modx ; \
rm -rf modx

If in tmp directory cleanup.

rmdir app/resources
rmdir app
rmdir helm/rates-app/templates
rmdir helm/rates-app
rmdir helm
rmdir helm-common

```
Run Tar from src
```
cd src
tar cvf ../tools/modx.tar .
```
Test UnTar in tmp
```
cd tmp
tar xzvf ../tools/modx.tar -k
```
Test at top
```
tar xzvf tools/modx.tar -k
```