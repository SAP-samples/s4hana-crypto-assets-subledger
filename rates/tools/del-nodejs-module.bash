#!/bin/bash
source $(dirname "$0")/config.sh
runit=false

# echo "param: $1"

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
echo "moduleName to be deleted: "${MODULENAME}

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

cmd='rm -rf '${MODULENAME}
exec_or_dump "$cmd"

cmd='rm -f helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd='rm -rf helm/'${PROJECTNAME}'-'${MODULENAME}
exec_or_dump "$cmd"

cmd='rm -f helm/'${PROJECTNAME}'-app/templates/configmap.yaml.modx'
exec_or_dump "$cmd"

cmd='rm -rf app/xs-app.json.modx'
exec_or_dump "$cmd"

cmd='rm -rf app/resources/index.html.modx'
exec_or_dump "$cmd"

cmd='rm -rf Makefile.modx'
exec_or_dump "$cmd"

cmd='echo ""'
exec_or_dump "$cmd"

fi

echo ""

echo "Finished"
