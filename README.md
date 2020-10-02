Tamuro
==========

## Note: how to create this project

### Firebase project

https://console.firebase.google.com/

- Add project: [Project ID]
- [Project ID]
    - Project overview
        - Project settings
            - Google Cloud Platform (GCP) resource location: asia-northeast1 or 2
    - Authentication
        - Sign-in method
            - Email/Password: Enable
                - Email link (passwordless sign-in): Enable
            - enable other methods
    - Database
        - Cloud Firestore
            - Create Database: Start in production mode
    - Storage -> Get started
    - Hosting -> Get started
    - Functions -> Get started

https://console.cloud.google.com

- Billing
    - APIs & Services
        - Library
            - Search "IAM" -> Identity and Access Management (IAM) API
                - Enable
- IAM & admin
    - [Project ID]@appspot.gserviceaccount.com
        - ADD ANOTHER ROLL: Service Account Token Creator

### Source

```
$ npm -g install npm n firebase-tools eslint @vue/cli
$ n 10
$ node --version                                                                        [21:22:57]
v10.22.0
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
$ firebase login
$ firebase init
? Which Firebase CLI features do you want to set up for this folder?
    Firestore, Functions, Hosting, Storage, Emulators
? Select a default Firebase project for this directory:
    Using project tamuro-test01
$ node tools/resetTestVersion.js
$ echo "export default 'Web API Key'" > src/plugins/firebase-api-key.js
```

https://console.firebase.google.com/

- [Project ID]
    - Project settings
        - Service accounts
            - Firebase Admin SDK
                - Generate new private key

```
$ mv ~/Downloads/tamuro-test01-firebase-adminsdk-q49yg-xxxxxxxx.json ./tamuro-test01-firebase-adminsdk.json
```

### Setup service

```
$ node ./tools/setupService.js                                                                                                           [0:09:31]
✔ Display name: … Michinobu Maeda
✔ E-mail: … michinobumaeda@gmail.com
✔ Password: … ********
```

## Links

- Vue.js: https://vuejs.org/
- Vuetify: https://vuetifyjs.com/
- Firebase: https://firebase.google.com/
