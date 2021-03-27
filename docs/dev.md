Development
=====

[README.md](../README.md)

## Prerequisites

```
$ git --version
git version ...
$ npm -g install npm n firebase-tools eslint @vue/cli
$ n 12
$ node --version
v12....
$ java -version
openjdk version "11..."
```

## Set up

Get Node.js packages.

```
$ git clone git@github.com:MichinobuMaeda/tamuro.git

    If you haven't registered your SSH Key on GitHub...

$ git clone https://github.com/MichinobuMaeda/tamuro.git
```

Get Node.js packages.

```
$ cd tamuro
$ cd functions
$ yarn
$ cd ..
$ yarn
```

Set ui version.

```
$ node tools/resetTestVersion.js
$ cat src/conf/version.js
export default '0000000'

    or

$ node tools/setTestVersion.js
$ cat src/conf/version.js
export default 'xxxxxxx'
```

Set dummy firebase API key.

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

Run only one test suites.

```
$ ./tools/testOnly.sh tests/unit/auth/admin.spec.js
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
