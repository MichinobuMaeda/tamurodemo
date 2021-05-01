Create this project
=====

[README](../README.md)

[Prerequisites](prerequisites.md)

## Vue.js

- Vue.js: https://vuejs.org/
- Vuetify: https://vuetifyjs.com/

```
$ vue create tamuro
$ cd tamuro
$ vue add router
? Use history mode for router? no
$ vue add i18n
$ vue add vuetify
$ vue add pwa
$ vue add unit-jest
$ vue add eslint
? Pick an ESLint config: Standard
? Pick additional lint features: Lint on save
```

## Firebase

- Firebase: https://firebase.google.com/

https://console.firebase.google.com/

- Add project: [Project ID]
    - for your Firebase project
        - Enable Google Analytics for this project: On
- [Project ID]
    - Usage and billing
        - Details & settings
            - Modify plan: Blaze
    - Project settings
        - General
            - Default GCP resource location: asia-northeast1 (Tokyo) or 2 (Osaka)
            - Public settings
                - Public-facing name: [Project ID]
                - Support email: your email address
            - Your apps
                - Web (</>)
                    - App nickname
                    - Also set up Firebase Hosting for this app.
                    - Firebase SDK snippet: [Config] -- paste to ``src/plugins/firebase.js`` except ``apiKey``
            - Web API Key: [Web API Key] -- use later
        - Service accounts
            - Firebase Admin SDK
                - Generate new private key -- download and rename --> ``firebase-adminsdk.json``
        - Usage and billing
            - Modify plan
                - Blaze [Select plan] → [Purchase]
        - Cloud Messageing
            - Web configuration
                - Web Push certificates
                    - Generate key pair
                        - Key pair: [Web Push certificates] -- paste to ``src/plugins/firebase.js`` except ``webPushCertificateKey``
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
$ firebase login
$ firebase login:ci
[CI token] -- use later
$ firebase use [Project ID]
? Which Firebase CLI features do you want to set up for this folder?
    Firestore, Functions, Hosting, Storage, Emulators
? Select a default Firebase project for this directory:
    Using project [Project ID]
```

## Codecov

https://codecov.io/

- Setting
    - Repositories
        - Add new repository -> [CODECOV_TOKEN] 

## Git

Create git repository and push sources.

Set CI/CD Secrets

- Actions
    - Settings
        - Secrets
            - New repository secret
                - WEB_API_KEY: [Web API Key]
                - FIREBASE_CI_TOKEN: [CI token]
                - CODECOV_TOKEN: [CODECOV_TOKEN]

## Initial data

```
$ node ./tools/setupService.js
? Web API key: 
? Display name: 
? E-mail: 
? Password: 
```

[Set up a local development environment](dev.md)
