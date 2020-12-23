Development
=====

[README.md](../README.md)

## Accounts

- GitHub: ``MichinobuMaeda/tamuro``
- Firebase: ``tamuro-test01``

## Prerequisites

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

```
$ yarn test:unit
i  emulators: Starting emulators: firestore, hosting
 ... ... ...
i  hub: Stopping emulator hub
✨  Done in 113.64s.
```

Open coverage report with a web browser: ``<Project>/coverage/lcov-report/index.html``

## Local server

```
$ yarn serve
 INFO  Starting development server...
   ... ... ...
  App running at:
  - Local:   http://localhost:8000/
   ... ... ...
```

1. Start Firebase emulator. UI: http://localhost:4000/
2. Insert test data.
3. Start vue local server without PWA mode.

Test accounts

| email | password | manager | admin | tester | valid | deleted |
| --- | --- | --- | --- | --- | --- | --- |
| primary@example.com | password | o | o | - | o | - |
| manager@example.com | password | o | - | - | o | - |
| admin@example.com | password | - | o | - | o | - |
| tester@example.com | password | - | - | o | o | - |
| user??@example.com | password | - | - | - | o | - |
| invalid@example.com | password | - | - | - | - | - |
| deleted@example.com | password | - | - | - | o | o |


Stop local server

^C
