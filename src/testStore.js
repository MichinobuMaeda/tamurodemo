/*  
 * Copyright (c) 2017, Michinobu Maeda 
 * Licensed under the MIT License.
 * See LICENSE file in the project root for full license information.  
 */

const testStore = {
  title: 'サンプル 2',
  primary: {
    top: 'G0001',
    admin: 'G0002',
    manager: 'G0003',
  },
  groups: [
    {
      _id: 'G0001',
      name: 'サンプル 1',
      uids: [],
      gids: ['G0002', 'G0003'],
    },
    {
      _id: 'G0002',
      name: 'システム担当者',
      uids: ['U0001'],
      gids: [],
    },
    {
      _id: 'G0003',
      name: '管理者',
      uids: ['U0001'],
      gids: [],
    },
  ],
  users: [
    {
      _id: 'U0001',
      name: '龍之介',
      profiles: [
        {
          name: "氏名",
          read: [],
          write: [],
          firstName: "龍之介",
          middleName: "",
          lastName: "芥川",
        },
        {
          name: "カナ",
          read: [],
          write: [],
          firstName: "リュウノスケ",
          middleName: "",
          lastName: "アクタガワ",
        },
        {
          name: "Name",
          read: [],
          write: [],
          firstName: "Ryunosuke",
          middleName: "",
          lastName: "Akutagawa",
        },
        {
          name: "自宅",
          read: [],
          write: [],
          zip: "123-4567",
          country: "日本",
          state: "東京都",
          city: "東村山市",
          street: "東村山3-1-1",
          bldg: "東村山アパート101",
          tel: "01-2345-6789",
          email: "ryunosuke@akutagawa",
        },
        {
          name: "職場",
          read: [],
          write: [],
          zip: "001-0001",
          country: "日本",
          state: "東京都",
          city: "千代田区",
          street: "大手町1-1-1",
          bldg: "大手町ビルヂング101",
          tel: "01-2345-6787",
          fax: "01-2345-6788",
          email: "ryunosuke@otemachi.co.jp",
        },
        {
          name: "実家",
          read: [],
          write: [],
          firstName: "龍之介",
          lastName: "道章",
          zip: "790-1234",
          country: "日本",
          state: "愛媛県",
          city: "松山市",
          street: "堀内1-1-1",
          bldg: "",
          tel: "01-2345-6787",
        },
      ],
    },
  ],
}

export default testStore
