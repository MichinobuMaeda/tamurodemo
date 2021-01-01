#!/bin/bash
firebase emulators:exec --only firestore,hosting "node ./node_modules/.bin/vue-cli-service test:unit $1"
