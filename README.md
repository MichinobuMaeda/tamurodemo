Tamuro
=======

## Setup

### Install or update Node.js global packages

```
$ node --version
v10.xx.x
$ npm i npm -g
$ npm i yarn -g
$ npm i firebase-tools -g
$ npm install -g @quasar/cli
```

### firebase project

https://console.firebase.google.com/

 * Add project: [Project ID]
 * [Project ID]
   * Project overview
     * Project settings
       * Google Cloud Platform (GCP) resource location: asia-northeast1 or 2
   * Authentication
     * Sign-in method
       * Email/Password: Enable
         * Email link (passwordless sign-in): Enable
       * enable other methods
   * Database
     * Cloud Firestore
       * Create Database: Start in production mode
   * Storage -> Get started
   * Hosting -> Get started
   * Functions -> Get started

https://console.cloud.google.com

 * Billing
 * IAM & admin
   * [Project ID]@appspot.gserviceaccount.com
     * ADD ANOTHER ROLL: Service Account Token Creator
 * Storage
   * Browser
     * [Project ID].appspot.com
       * Edit bucket permissions
         * Simplify access control with Bucket Policy Only: Enable
         * Add members
           * New members: allUsers
           * Role: Storage Object Viewer

### Development environment

Fork git@github.com:MichinobuMaeda/tamuro.git
to git@github.com:[Your Accuont]/[Project Name].git

```
$ git clone git@github.com:[Your Accuont]/[Project Name].git
$ cd [Project Name]
$ cd functions
$ npm install
$ cd ..
$ yarn
$ cp .firebaserc-sample .firebaserc
$ cp src/conf/firebase-sample.js src/conf/firebase.js
```

edit .firebaserc

```
{
  "projects": {
    "default": "[Project ID]"
  }
}
```

https://console.firebase.google.com/
 * [Project ID]
   * Project overview
     * Project settings
       * Your apps
         * </>

Copy ``var firebaseConfig = { ... }`` and paste to ``src/conf/firebase.js``

```
$ firebase login
$ firebase projects:list
```

### Service

```
$ firebase deploy --only functions,firestore,stroage
```

https://us-central1-[Project ID].cloudfunctions.net/tamuro/setup

return

```
{ "status": "ok" }
```

https://console.firebase.google.com/
 * [Project ID]
   * Database
     * service
       * ui
       * line

### The primary account and groups

https://us-central1-[Project ID].cloudfunctions.net/tamuro/initialize

return

```
{ "url": "https://..." }
```
