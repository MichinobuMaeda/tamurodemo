# Response

[index](./index.md)

## Group

```
{
  _id: gid,
  ver: Number ( > 1 ),
  name: Text,
  role: GROUP_ROLE,
  desc: Text,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  groups: [gid],
  subGroups: [gid],
  users: [uid],
  owners: [uid],
}
```

## User

```
{
  _id: uid,
  ver: Number ( > 1 ),
  name: Text,
  desc: Text,
  profiles: [{...}],
  groups: [gid],
  ownedGroups: [gid],
  certs: [
    {
      ver: Number ( > 1 ),
      provider: PROVIDER,
      key: Text,
      secret: Text,
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

## Errors

```
{
  errors: [
    {
      error: ERRORS,
      param: {...},
    },
  ],
}
```

## Status

### for guest

```
{
  title: {
    val: Text,
  },
  top: {
    name: Text,
  },
}
```

### for member

```
{
  title: {
    val: Text,
    ver: Number ( > 1 ),
  },
  top: {
    _id: rid,
    name: Text,
  },
  session: {
    _id: sid,
    uid: uid,
    gids: [gid], -- they belong to those groups.
    oids: [gid], -- they owe those groups.
    provider: PROVIDER,
    isManager: boolean,
    isAdmin: boolean,
    createdAt: Timestamp,
    updatedAt: Timestamp,
  },
  me: User,
}
```

## Help

```
[
  {
    val: Text,
    pid: Text,
    ver: Number ( > 1 ),
    createdAt: Timestamp,
    updatedAt: Timestamp,
  },
]
```
