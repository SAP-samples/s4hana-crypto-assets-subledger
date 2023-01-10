#!/bin/bash
runit=false

echo "param: $1"

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

cmd='sed -i -e "s/modx/'$moduleName'/g" Makefile.modx'
exec_or_dump "$cmd"

fi

echo ""

echo "Finished"
