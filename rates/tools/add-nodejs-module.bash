#!/bin/bash
runit=false

echo "param: $1"

replace="sed -I '' -e"
replacebak="sed -I '.bak' -e"
projectName='rates'
moduleName='xyox'

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

cmd='tar xzvf tools/modx.tar'
exec_or_dump "$cmd"

cmd='echo Edit Makefile, replace modx with '$moduleName' and delete Makefile.modx'
exec_or_dump "$cmd"

cmd=$replacebak' "s/projx-modx/'$projectName'-'$moduleName'/g" Makefile.modx'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" Makefile.modx'
exec_or_dump "$cmd"

cmd=$replacebak' "s/modx/'$moduleName'/g" app/resources/index.html.modx'
exec_or_dump "$cmd"

cmd=$replacebak' "s/modx/'$moduleName'/g" app/xs-app.json.modx'
exec_or_dump "$cmd"

cmd=$replace' "s/projx-modx/'$projectName'-'$moduleName'/g" helm/projx-modx/Chart.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm/projx-modx/templates/apirule.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/projx-modx/'$projectName'-'$moduleName'/g" helm/projx-modx/templates/Chart.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm/projx-modx/templates/configmap.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm/projx-modx/templates/deployment.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm/projx-modx/templates/service.yaml'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm/projx-app/templates/configmap.yaml.modx'
exec_or_dump "$cmd"

cmd='mv helm/projx-modx helm/'$projectName'-'$moduleName
exec_or_dump "$cmd"

cmd='mv helm/projx-app helm/'$projectName'-app'
exec_or_dump "$cmd"


cmd=$replacebak' "s/projx-modx/'$projectName'-'$moduleName'/g" helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" helm-common/values.yaml.modx'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" modx/Dockerfile'
exec_or_dump "$cmd"

cmd=$replace' "s/projx-modx/'$projectName'-'$moduleName'/g" modx/package.json'
exec_or_dump "$cmd"

cmd=$replace' "s/modx/'$moduleName'/g" modx/server.js'
exec_or_dump "$cmd"

cmd='mv modx '$moduleName
exec_or_dump "$cmd"

fi

echo ""

echo "Finished"
