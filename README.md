Tamuro
=======

## Setup

### Node.js global packages

```
$ node --version
v10.x.x
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
   * Dynamic Links -> Get started

https://console.cloud.google.com

 * Billing
 * APIs & Services
   * Library
     * Search "IAM" -> Identity and Access Management (IAM) API
       * Enable
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

### Setup keys

```
$ firebase functions:config:set initialize.key=.....
$ firebase functions:config:set short_links.key=[Web API Key]
$ firebase functions:config:set short_links.prefix=[https://...]
$ firebase functions:config:set ui.url=[https://.../]
$ firebase functions:config:get
{
  "init": {
    "key": "....."
  },
  "short_links": {
    "key": "[Web API Key]",
    "prefix": "[https://...]"
  },
  "ui": {
    "url": "[https://.../]"
  }
}
$ firebase functions:config:get > functions/.runtimeconfig.json
```

### Setup CI

* [Using GitLab CI/CD with a GitHub repository](https://docs.gitlab.com/ee/ci/ci_cd_for_external_repos/github_integration.html)
* [Firebase Hosting Deployment Automation with Gitlab CI](https://medium.com/@rambabusaravanan/firebase-hosting-deployment-automation-with-gitlab-ci-f3fad9130d62)

* Settings
  * Variables
    * API_KEY:
    * APP_ID:
    * AUTH_DOMAIN: 
    * DATABASE_URL:
    * FIREBASE_TOKEN: 
    * MESSAGEING_SENDER_ID:
    * PROJECT_ID:
    * STRAGE_BUCKET:
    * WEB_API_KEY:
    * FUNCTIONS_INITIALIZE_KEY: .....

### Development environment

Fork ``git@github.com:MichinobuMaeda/tamuro.git``
to ``git@github.com:[Your Accuont]/[Project Name].git``

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

Edit .firebaserc

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

Copy ``var firebaseConfig = { ... }`` and paste to ``src/conf/firebase.js`` and replace " to '.

```
$ firebase login
$ firebase use [Project ID]
$ firebase projects:list
```

### Service

```
$ yarn deployWithoutUI
```

curl https://us-central1-[Project_ID].cloudfunctions.net/tamuro/setup

```
status: ok
```

Fill empty fields of docs.

https://console.firebase.google.com/
 * [Project ID]
   * Database
     * service
       * ui
       * line
       * yahoojp -- under construction
       * mixi -- under construction

Edit ``src/conf/auth.js``

### The primary account and groups

curl https://us-central1-[Project_ID].cloudfunctions.net/tamuro/initialize

```
status: ok
https://...
```
