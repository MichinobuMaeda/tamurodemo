# Storage

[index](./index.md)

## Tables

### group

|Name      |Type     |Constraint  |
|----------|---------|------------|
|_id       |Text     |Primary Key |
|ver       |Integer  |not null    |
|name      |Text     |not null    |
|role      |Text     |            |
|desc      |Text     |            |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

### user

|Name      |Type     |Constraint  |
|----------|---------|------------|
|_id       |Text     |Primary Key |
|ver       |Integer  |not null    |
|name      |Text     |not null    |
|profiles  |JsonB    |not null    |
|desc      |Text     |            |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

### subGroup

|Name      |Type     |Constraint  |
|----------|---------|------------|
|gid       |Text     |Primary Key |
|sid       |Text     |Primary Key |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

 * gid --> group._id
 * sid --> group._id

### member

|Name      |Type     |Constraint  |
|----------|---------|------------|
|gid       |Text     |Primary Key |
|uid       |Text     |Primary Key |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

 * gid --> group._id
 * uid --> user._id

### owner

|Name      |Type     |Constraint  |
|----------|---------|------------|
|gid       |Text     |Primary Key |
|uid       |Text     |Primary Key |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

 * gid --> group._id
 * uid --> user._id

### cert

|Name      |Type     |Constraint  |
|----------|---------|------------|
|uid       |Text     |Primary Key |
|provider  |Text     |Primary Key |
|ver       |Integer  |not null    |
|key       |Text     |not null    |
|secret    |Text     |            |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

 * uid --> user._id

### session

|Name      |Type     |Constraint  |
|----------|---------|------------|
|_id       |Text     |Primary Key |
|uid       |Text     |not null    |
|gids      |Text[]   |not null    |
|oids      |Text[]   |not null    |
|provider  |Text     |not null    |
|isManager |Boolean  |not null    |
|isAdmin   |Boolean  |not null    |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

 * uid --> user._id

### log

|Name      |Type     |Constraint  |
|----------|---------|------------|
|_id       |Text     |Primary Key |
|level     |Text     |not null    |
|sid       |Text     |            |
|rec       |JsonB    |not null    |
|createdAt |Timestamp|not null    |

### preference

|Name      |Type     |Constraint  |
|----------|---------|------------|
|ver       |Integer  |not null    |
|pid       |Text     |Primary Key |
|val       |Text     |not null    |
|createdAt |Timestamp|not null    |
|updatedAt |Timestamp|not null    |

## Test DB

```bash
mkdir ${PROJECT_HOME}/tmp/db
/usr/local/pgsql/bin/initdb -D ${PROJECT_HOME}/tmp/db
/usr/local/pgsql/bin/pg_ctl -D ${PROJECT_HOME}/tmp/db -l ${PROJECT_HOME}/tmp/db/log.txt start
/usr/local/pgsql/bin/createdb test

/usr/local/pgsql/bin/psql test

/usr/local/pgsql/bin/pg_ctl -D ${PROJECT_HOME}/tmp/db  stop
```
