#!/bin/bash
runit=false

echo "param: $1"

replace="sed -I '' -e"
replacebak="sed -I '.bak' -e"
projectName='rates'
projectName=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].projectName')
# moduleName='xyox'
moduleName='yyoy'
dockerID='alunde'
dockerID=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].dockerID')
clusterDomain='af4cba2.kyma.ondemand.com'
clusterDomain=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].clusterDomain')
gateway='kyma-gateway.kyma-system.svc.cluster.local'
gateway=$(cat .yo-rc.json | jq -r '.["generator-saphanaacademy-saas"].gateway')

echo "projectName: "$projectName
echo "dockerID: "$dockerID
echo "clusterDomain: "$clusterDomain
echo "gateway: "$gateway
echo "new moduleName will be: "$moduleName

if [ "$1" = "dryrun" ] ; then
    runit=false
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

cmd='rm -rf '$moduleName
exec_or_dump "$cmd"

cmd='rm -f helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd='rm -rf helm/'$projectName'-'$moduleName
exec_or_dump "$cmd"

cmd='rm -f helm/'$projectName'-app/templates/configmap.yaml.modx'
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
