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
    ver: 0,
    top: 'B1lHc7Fi8b',
    admin: 'ry-SqmKsUW',
    manager: 'SJzBqmFjIZ',
  }
)
db.groups.insertMany([
  {
    _id: 'B1lHc7Fi8b',
    ver: 0,
    name: 'サンプル 4',
    desc: '権限によって表示されるメニューが異なります。詳しくは右上のメニューの「ヘルプ」を見てください。',
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
    ver: 0,
    name: 'システム担当者',
    gids: [],
    uids: ['HkHHcXFsLb', 'r1KHq7FjIb'],
  },
  {
    _id: 'SJzBqmFjIZ',
    ver: 0,
    name: '管理者',
    gids: [],
    uids: ['HkHHcXFsLb', 'Sy_HcQtjLZ'],
  },
  {
    _id: 'SyXBcmKi8-',
    ver: 0,
    name: 'ノーベル賞受賞者',
    gids: [],
    uids: ['HyIH5XFoL-', 'rywB5mKiUW'],
  },
  {
    _id: 'Hy4B97YiIZ',
    ver: 0,
    name: '芥川賞受賞者',
    gids: [],
    uids: ['HyIH5XFoL-', 'Sy_HcQtjLZ', 'r1KHq7FjIb'],
  },
])
db.users.insertMany([
  {
    _id: 'HkHHcXFsLb',
    ver: 0,
    name: 'りゅー',
    desc: '本名：芥川龍之介\n本人は芥川賞はもらってません。',
    profiles: [
      {
        title: { v: '自宅', p: ['B1lHc7Fi8b'] },
        zip: { v: '123-4567', p: ['B1lHc7Fi8b'] },
        country: { v: '日本', p: ['B1lHc7Fi8b'] },
        state: { v: '東京都', p: ['B1lHc7Fi8b'] },
        city: { v: '東村山市', p: ['B1lHc7Fi8b'] },
        street: { v: '東村山3-1-1', p: ['B1lHc7Fi8b'] },
        bldg: { v: '東村山アパート101', p: ['B1lHc7Fi8b'] },
        tel: { v: '01-2345-6789', p: ['B1lHc7Fi8b'] },
        email: { v: 'ryunosuke@akutagawa', p: ['B1lHc7Fi8b'] },
        name: { v: '芥川龍之介', p: ['B1lHc7Fi8b'] },
      },
      {
        title: { v: '職場', p: ['B1lHc7Fi8b'] },
        zip: { v: '001-0001', p: ['B1lHc7Fi8b'] },
        country: { v: '日本', p: ['B1lHc7Fi8b'] },
        state: { v: '東京都', p: ['B1lHc7Fi8b'] },
        city: { v: '千代田区', p: ['B1lHc7Fi8b'] },
        street: { v: '大手町1-1-1', p: ['B1lHc7Fi8b'] },
        bldg: { v: '大手町ビルヂング101', p: ['B1lHc7Fi8b'] },
        tel: { v: '01-2345-6787', p: [] },
        fax: { v: '01-2345-6788', p: [] },
        email: { v: 'ryunosuke@otemachi.co.jp', p: ['B1lHc7Fi8b'] },
        name: { v: '芥川龍之介', p: ['B1lHc7Fi8b'] },
      },
      {
        title: { v: '実家', p: [] },
        zip: { v: '790-1234', p: [] },
        country: { v: '日本', p: [] },
        state: { v: '愛媛県', p: [] },
        city: { v: '松山市', p: [] },
        street: { v: '堀内1-1-1', p: [] },
        tel: { v: '01-2345-6787', p: [] },
        name: { v: '芥川道章', p: [] },
      },
    ],
  },
  {
    _id: 'HyIH5XFoL-',
    ver: 0,
    name: '大江健三郎',
    profiles: [
    ],
  },
  {
    _id: 'rywB5mKiUW',
    ver: 0,
    name: '川端康成',
    desc: '芥川賞が創設されたときにはもう新人ではなく、選考委員になりました。',
    profiles: [
    ],
  },
  {
    _id: 'Sy_HcQtjLZ',
    ver: 0,
    name: '柳美里',
    profiles: [
    ],
  },
  {
    _id: 'r1KHq7FjIb',
    ver: 0,
    name: '目取真俊',
    profiles: [
    ],
  },
])
db.creds.insertMany([
  {
    _id: 'rycBq7FsIb',
    ver: 0,
    uid: 'HkHHcXFsLb',
    provider: 'password',
    authId: 'ryu',
    password: 'd1f691086161cce8641c023ed43fec2f232d0a56669f2081de2597268f3ca6da',
  },
  {
    _id: 'H1iScQto8W',
    ver: 0,
    uid: 'HyIH5XFoL-',
    provider: 'password',
    authId: 'ken',
    password: '8ced7c0895a9cea036423343e7ab79fb6b93c8e7fa24411480c9aaa72fb4a157',
  },
  {
    _id: 'rynH97toUb',
    ver: 0,
    uid: 'rywB5mKiUW',
    provider: 'password',
    authId: 'yasu',
    password: '7b25481a36d7657ba68377747686ea31f86c23a18708b24f9444c966b76460d0',
  },
  {
    _id: 'SJaB97Ys8W',
    ver: 0,
    uid: 'Sy_HcQtjLZ',
    provider: 'password',
    authId: 'miri',
    password: '52f98dc0ab7075a5c2a11d7fe0860edc78acb90e187fc63397f83cbe54fc2a92',
  },
  {
    _id: 'r1Ar5mYjLW',
    ver: 0,
    uid: 'r1KHq7FjIb',
    provider: 'password',
    authId: 'shun',
    password: '2650362b7a13d46afbc5e549a593238dfd9a5740cd54a0aebeecc8f1b95f929d',
  },
])
