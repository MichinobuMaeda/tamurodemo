#!/bin/bash
VERSION=`node <<CODE
console.log((new Date()).getTime().toString(21))
CODE
`
echo "export default '$VERSION'" > src/utils/version.js
echo set version: $VERSION
