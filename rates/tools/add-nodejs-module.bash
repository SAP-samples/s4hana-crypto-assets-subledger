#!/bin/bash
source $(dirname "$0")/config.sh
runit=false

# echo "param1: $1"
# echo "param2: $2"

# echo $#

if [ "$#" -ge "1" ]; then
  MODULENAME=$1
fi

FILE=$(dirname "$0")/.yo-rc.json
if [ -f "$FILE" ]; then
  PROJECTNAME=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].projectName')
  DOCKER_ID=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].dockerID')
  CLUSTER_DOMAIN=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].clusterDomain')
  GATEWAY=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].gateway')
fi

echo "projectName: "${PROJECTNAME}
echo "dockerID: "${DOCKER_ID}
echo "clusterDomain: "${CLUSTER_DOMAIN}
echo "gateway: "${GATEWAY}
echo "new moduleName will be: "${MODULENAME}

if [ "$#" -ge "2" ]; then
 if [ "$2" = "dryrun" ] ; then
    runit=false
  else
    runit=true
  fi
else
  runit=true
fi

if [ "$runit" = true ] ; then
    echo "Actually running these commands."
else
    echo "Performing a dry run."
fi

function exec_or_dump() {

        xcmd=$1
        echo $xcmd
        if [ "$runit" = true ] ; then
            eval $xcmd
        fi

}

read -p "Do you wish to continue? " yn
if [ $yn == "y" ]; then 

echo ""

cmd='tar xzvf tools/modx.tar'
exec_or_dump "$cmd"

cmd='echo Edit Makefile, replace modx with '${MODULENAME}' and delete Makefile.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/projx-modx/'${PROJECTNAME}'-'${MODULENAME}'/g" Makefile.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" Makefile.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" app/resources/index.html.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" app/xs-app.json.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/projx-modx/'${PROJECTNAME}'-'${MODULENAME}'/g" helm/projx-modx/Chart.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm/projx-modx/templates/apirule.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm/projx-modx/templates/configmap.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm/projx-modx/templates/deployment.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/projx/'${PROJECTNAME}'/g" helm/projx-modx/templates/deployment.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm/projx-modx/templates/service.yaml'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm/projx-app/templates/configmap.yaml.modx'
exec_or_dump "$cmd"

cmd='mv helm/projx-modx helm/'${PROJECTNAME}'-'${MODULENAME}
exec_or_dump "$cmd"

cmd='mv helm/projx-app/templates/configmap.yaml.modx helm/'${PROJECTNAME}'-app/templates'
exec_or_dump "$cmd"

cmd='rmdir helm/projx-app/templates'
exec_or_dump "$cmd"

cmd='rmdir helm/projx-app'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/projx-modx/'${PROJECTNAME}'-'${MODULENAME}'/g" helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" modx/Dockerfile'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/projx-modx/'${PROJECTNAME}'-'${MODULENAME}'/g" modx/package.json'
exec_or_dump "$cmd"

cmd=${REPLACE}' "s/modx/'${MODULENAME}'/g" modx/server.js'
exec_or_dump "$cmd"

cmd='mv modx '${MODULENAME}
exec_or_dump "$cmd"

cmd='echo ""'
exec_or_dump "$cmd"

cmd='echo Edit app/resources/index.html, incorporate diffs from index.html.modx'
exec_or_dump "$cmd"

cmd='echo Edit app/xs-app.json, incorporate diffs from xs-app.json.modx'
exec_or_dump "$cmd"

cmd='echo Edit helm/'${PROJECTNAME}'-app/templates/configmap.yaml, incorporate diffs from configmap.yaml.modx'
exec_or_dump "$cmd"

cmd='echo Edit helm-common/values.yaml, insert '${PROJECTNAME}' section from values.yaml.modx and adjust ports.'
exec_or_dump "$cmd"

cmd='echo ""'
exec_or_dump "$cmd"

fi

echo ""

echo "Finished"
