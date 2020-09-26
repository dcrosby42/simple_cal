#!/bin/bash
pushd `dirname ${BASH_SOURCE[0]}` > /dev/null; HERE=`pwd`; popd > /dev/null
cd $HERE

PORT=$1
# : ${PORT:="8000"}

npx http-server web -c-1 -p ${PORT:="8000"} -o index.html
