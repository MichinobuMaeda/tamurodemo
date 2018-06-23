export PROJECT_ID=tamuro-test
firebase list
firebase use $PROJECT_ID

node admin/export-firestore.js > ./tmp/$PROJECT_ID-firestore.json
node admin/clear-firestore.js
node admin/import-firestore.js < ./tmp/$PROJECT_ID-firestore.json

firebase auth:export ./tmp/$PROJECT_ID-accounts.json
firebase auth:import ./tmp/$PROJECT_ID-accounts.json
