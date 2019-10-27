#!/bin/bash
VERSION=`cat src/utils/version.js | sed  "s/'$//" |sed "s/.*'//"`

quasar build -m pwa
firebase use tamuro-dev1
firebase deploy

ECHO deployed version: $VERSION
