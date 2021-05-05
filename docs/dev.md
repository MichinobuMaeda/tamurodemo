Development environment
=====

[README](../README.md)

[Prerequisites](prerequisites.md)

## Clone git repository.

```
$ git clone git@github.com:MichinobuMaeda/tamuro.git

    If you haven't registered your SSH Key on GitHub...

$ git clone https://github.com/MichinobuMaeda/tamuro.git
```

## Get Node.js packages.

```
$ cd tamuro
$ cd functions
$ yarn
$ cd ..
$ yarn
```

## Unit test

```
$ yarn test:unit
i  emulators: Starting emulators: firestore, hosting
 ... ... ...
i  hub: Stopping emulator hub
✨  Done in 113.64s.
```

Coverage report: ``<Project>/coverage/lcov-report/index.html``

If you want to run only one test suites.

```
$ ./tools/testOnly.sh tests/unit/auth/admin.spec.js
```

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


Stop local server with [Ctrl]+[C]
