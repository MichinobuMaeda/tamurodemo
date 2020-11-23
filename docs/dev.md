Development
=====

[README.md](../README.md)

- terminal #1: exec commands
- terminal #2: Firebase emulator
- terminal #3: Vue local server

## Accounts

- GitHub: ``MichinobuMaeda/tamuro``
- Firebase: ``tamuro-test01``

## Prerequisites

on terminal #1

```
$ git --version                                                                                  [2:14:32]
git version ...
$ npm -g install npm n firebase-tools eslint @vue/cli
$ n 10
$ node --version
v10....
```

## Set up

```
$ git clone git@github.com:MichinobuMaeda/tamuro.git
$ cd tamuro
$ cd functions
$ yarn
$ cd ..
$ yarn
$ firebase login
$ firebase projects:list
$ firebase use tamuro-test01
Now using project tamuro-test01

$ node tools/resetTestVersion.js
$ cat src/conf/version.js
export default '0000000'

or

$ node tools/setTestVersion.js
$ cat src/conf/version.js
export default 'xxxxxxx'
```

Get "Web API Key"

- https://console.firebase.google.com/
    - tamuro-test01
        - Project overview
            - Project Settings
                - Web API Key: 'Axxxxxxxxxxxxxxxxxxx'

Set "Web API Key"

```
$ echo "export default 'Axxxxxxxxxxxxxxxxxxx'" > src/plugins/firebase-api-key.js
$ cat src/plugins/firebase-api-key.js
export default 'Axxxxxxxxxxxxxxxxxxx'
```

## Unit test

Run Unit test on terminal #1

```
$ yarn test:unit
i  emulators: Starting emulators: firestore, hosting
 ... ... ...
i  hub: Stopping emulator hub
✨  Done in 113.64s.
```

Open coverage report with a web browser: ``<Project>/coverage/lcov-report/index.html``

## Local server

Run emulator on terminal #2

```
$ firebase emulators:start
```

Open emulator UI: http://localhost:4000/

Set up test data on terminal #1

```
$ node tools/setupTestService.js
{"severity":"WARNING", ... }
Create: service.conf
 ... ... ...
complete
```

Run Vue local server on terminal #3

```
$ yarn serve
 INFO  Starting development server...
   ... ... ...
  App running at:
  - Local:   http://localhost:8000/
   ... ... ...
```

Test accounts

- primary@example.com / password -- manager, admin

Stop Vue local server on terminal #3

^C

Stop emulator on terminal #2

^C
