Firebase
=====

[README.md](../README.md)

- Firebase: https://firebase.google.com/

https://console.firebase.google.com/

- Add project: [Project ID]
    - for your Firebase project
        - Enable Google Analytics for this project: Off
- [Project ID]
    - Usage and billing
        - Details & settings
            - Modify plan: Blaze
    - Project settings
        - General
            - Default GCP resource location: asia-northeast1 (Tokyo) or 2 (Osaka)
            - Public settings
                - Public-facing name
                - Support email
        - Service accounts
            - Firebase Admin SDK
                - Generate new private key --> ``firebase-adminsdk.json``
    - Authentication
        - Sign in method
            - Email/Password: Enable
                - Email link (passwordless sign in): Enable
            - enable other methods
    - Cloud Firestore
        - Create Database: Start in production mode
    - Cloud Messageing
        - Send your first message
            - Enable Google Analytics
    - Project settings
        - Cloud Messageing
            - Web configuration
                - Web Push certificates
                    - Generate key pair
                        - Key pair: [Web Push certificates] -- paste to ``src/plugins/firebase.js`` except ``webPushCertificateKey``
        - General
            - Your apps
                - Web (</>)
                    - App nickname
                    - Also set up Firebase Hosting for this app.
                    - Firebase SDK snippet: [Config] -- paste to ``src/plugins/firebase.js`` except ``apiKey``
            - Web API Key: [Web API Key] -- use later

https://console.cloud.google.com

- Project: [Project ID]
- APIs & Services
    - Library
        - Search "IAM" -> Identity and Access Management (IAM) API
            - Enable
- IAM & admin
    - [Project ID]@appspot.gservicestate.me.com
        - ADD ANOTHER ROLL: Service Account Token Creator

paste [Project ID] to ``.firebaserc `` ``projects.default``

```
$ npm install -g firebase-tools
$ cd [Source directory]
$ firebase login
$ firebase login:ci
[CI token] -- use later
$ firebase use [Project ID]
? Which Firebase CLI features do you want to set up for this folder?
    Firestore, Functions, Hosting, Storage, Emulators
? Select a default Firebase project for this directory:
    Using project [Project ID]
$ node tools/resetTestVersion.js
$ echo "export default '[Web API Key]'" > src/plugins/firebase-api-key.js
$ yarn test:unit
$ yarn serve
    http://localhost:8000 -- App ( auto open )
    http://localhost:4000 -- Emulators
```

https://console.firebase.google.com/

https://github.com/MichinobuMaeda/[Source Project ID]

- Settings
    - New repository secret
        - WEB_API_KEY: [Web API Key]
        - FIREBASE_CI_TOKEN: [CI token]
