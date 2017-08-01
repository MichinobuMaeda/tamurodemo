/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

// apsiuye4rqlajkwehfdsiufhapiwueht2w9cxipu3apbfdkwa

db = connect('127.0.0.1:27017/tamuro_api')
db.users.remove({})
db.groups.remove({})
db.prims.remove({})
db.creds.remove({})
db.sessions.remove({})
db.logs.remove({})
db.prims.insertOne(
  {
    _id: 'r1rc7YiI-',
    top: 'B1lHc7Fi8b',
    admin: 'ry-SqmKsUW',
    manager: 'SJzBqmFjIZ',
  }
)
db.groups.insertMany([
  {
    _id: 'B1lHc7Fi8b',
    name: 'サンプル 3',
    gids: [
      'ry-SqmKsUW',
      'SJzBqmFjIZ',
      'SyXBcmKi8-',
      'Hy4B97YiIZ',
    ],
    uids: [],
  },
  {
    _id: 'ry-SqmKsUW',
    name: 'システム担当者',
    gids: [],
    uids: ['HkHHcXFsLb', 'r1KHq7FjIb'],
  },
  {
    _id: 'SJzBqmFjIZ',
    name: '管理者',
    gids: [],
    uids: ['HkHHcXFsLb', 'Sy_HcQtjLZ'],
  },
  {
    _id: 'SyXBcmKi8-',
    name: 'ノーベル賞受賞者',
    gids: [],
    uids: ['HyIH5XFoL-', 'rywB5mKiUW'],
  },
  {
    _id: 'Hy4B97YiIZ',
    name: '芥川賞受賞者',
    gids: [],
    uids: ['HyIH5XFoL-', 'Sy_HcQtjLZ', 'r1KHq7FjIb'],
  },
])
db.users.insertMany([
  {
    _id: 'HkHHcXFsLb',
    name: '芥川龍之介',
    profiles: [
      {
        name: '氏名',
        read: [],
        write: [],
        firstName: '龍之介',
        middleName: '',
        lastName: '芥川',
      },
      {
        name: 'カナ',
        read: [],
        write: [],
        firstName: 'リュウノスケ',
        middleName: '',
        lastName: 'アクタガワ',
      },
      {
        name: 'Name',
        read: [],
        write: [],
        firstName: 'Ryunosuke',
        middleName: '',
        lastName: 'Akutagawa',
      },
      {
        name: '自宅',
        read: [],
        write: [],
        zip: '123-4567',
        country: '日本',
        state: '東京都',
        city: '東村山市',
        street: '東村山3-1-1',
        bldg: '東村山アパート101',
        tel: '01-2345-6789',
        email: 'ryunosuke@akutagawa',
      },
      {
        name: '職場',
        read: [],
        write: [],
        zip: '001-0001',
        country: '日本',
        state: '東京都',
        city: '千代田区',
        street: '大手町1-1-1',
        bldg: '大手町ビルヂング101',
        tel: '01-2345-6787',
        fax: '01-2345-6788',
        email: 'ryunosuke@otemachi.co.jp',
      },
      {
        name: '実家',
        read: [],
        write: [],
        firstName: '龍之介',
        lastName: '道章',
        zip: '790-1234',
        country: '日本',
        state: '愛媛県',
        city: '松山市',
        street: '堀内1-1-1',
        bldg: '',
        tel: '01-2345-6787',
      },
    ],
  },
  {
    _id: 'HyIH5XFoL-',
    name: '大江健三郎',
    profiles: [
      {
        name: '氏名',
        read: [],
        write: [],
        firstName: '健三郎',
        middleName: '',
        lastName: '大江',
      },
    ],
  },
  {
    _id: 'rywB5mKiUW',
    name: '川端康成',
    profiles: [
      {
        name: '氏名',
        read: [],
        write: [],
        firstName: '康成',
        middleName: '',
        lastName: '川端',
      },
    ],
  },
  {
    _id: 'Sy_HcQtjLZ',
    name: '柳美里',
    profiles: [
      {
        name: '氏名',
        read: [],
        write: [],
        firstName: '美里',
        middleName: '',
        lastName: '柳',
      },
    ],
  },
  {
    _id: 'r1KHq7FjIb',
    name: '目取真俊',
    profiles: [
      {
        name: '氏名',
        read: [],
        write: [],
        firstName: '俊',
        middleName: '',
        lastName: '目取真',
      },
    ],
  },
])
db.creds.insertMany([
  {
    _id: 'rycBq7FsIb',
    uid: 'HkHHcXFsLb',
    provider: 'password',
    authId: 'ryu',
    password: 'd1f691086161cce8641c023ed43fec2f232d0a56669f2081de2597268f3ca6da',
  },
  {
    _id: 'H1iScQto8W',
    uid: 'HyIH5XFoL-',
    provider: 'password',
    authId: 'ken',
    password: '8ced7c0895a9cea036423343e7ab79fb6b93c8e7fa24411480c9aaa72fb4a157',
  },
  {
    _id: 'rynH97toUb',
    uid: 'rywB5mKiUW',
    provider: 'password',
    authId: 'yasu',
    password: '7b25481a36d7657ba68377747686ea31f86c23a18708b24f9444c966b76460d0',
  },
  {
    _id: 'SJaB97Ys8W',
    uid: 'Sy_HcQtjLZ',
    provider: 'password',
    authId: 'miri',
    password: '52f98dc0ab7075a5c2a11d7fe0860edc78acb90e187fc63397f83cbe54fc2a92',
  },
  {
    _id: 'r1Ar5mYjLW',
    uid: 'r1KHq7FjIb',
    provider: 'password',
    authId: 'shun',
    password: '2650362b7a13d46afbc5e549a593238dfd9a5740cd54a0aebeecc8f1b95f929d',
  },
])
