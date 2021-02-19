export const locales = [
  {
    text: 'English(US)',
    value: 'en_US',
    lang: 'en',
    nameItems: [
      { label: 'First name', key: 'firstName' },
      { label: 'Last name', key: 'lastName' },
      { label: 'Full name', key: 'fullName' },
      { label: 'Previous name', key: 'previousName' }
    ],
    socialItems: [
      { label: 'Facebook profile', key: 'facebook', placeholder: 'https://www.facebook.com/taro.yamada/' },
      { label: 'Twitter ID', key: 'twitter', placeholder: '@abcdefg' },
      { label: 'LINE ID', key: 'line', placeholder: 'tanakahanako.line' },
      { label: 'mixi ID', key: 'mixi', placeholder: '12345678' }
    ],
    addressItems: [
      { label: 'ZIP/postal code', key: 'zip', placeholder: '123-4567' },
      { label: 'Address', key: 'address' },
      { label: 'Apartment, suites, etc.', key: 'bldg' },
      { label: 'City', key: 'city' },
      { label: 'Prefecture/state/province', key: 'province' },
      { label: 'Country/region', key: 'country', placeholder: 'Japan' },
      { label: 'Name', key: 'name', placeholder: 'Your relatives or guardian, etc.' },
      { label: 'Tel', key: 'tel' },
      { label: 'Fax', key: 'fax' },
      { label: 'Cell phone', key: 'cell', placeholder: '+1 123-456-7890' },
      { label: 'E-mail', key: 'email' },
      { label: 'Note', key: 'note' }
    ]
  },
  {
    text: '日本語',
    value: 'ja_JP',
    lang: 'ja',
    nameItems: [
      { label: '姓', key: 'lastName' },
      { label: '名', key: 'firstName' },
      { label: '旧姓', key: 'previousName' },
      { label: 'Full name', key: 'fullName', placeholder: '日本国外の現地表記など' }
    ],
    socialItems: [
      { label: 'LINE ID', key: 'line', placeholder: 'tanakahanako.line' },
      { label: 'Facebookプロフィール', key: 'facebook', placeholder: 'https://www.facebook.com/taro.yamada/' },
      { label: 'Twitter ID', key: 'twitter', placeholder: '@abcdefg' },
      { label: 'mixi ID', key: 'mixi', placeholder: '12345678' }
    ],
    addressItems: [
      { label: '国/地域', key: 'country', placeholder: '日本' },
      { label: '郵便番号', key: 'zip', placeholder: '123-4567' },
      { label: '都道府県/州/省', key: 'province' },
      { label: '市区町村', key: 'city' },
      { label: '住所', key: 'address' },
      { label: '建物・部屋番号.', key: 'bldg' },
      { label: '宛先名', key: 'name', placeholder: '親族、後見人などの場合' },
      { label: '固定電話', key: 'tel' },
      { label: 'Fax', key: 'fax' },
      { label: '携帯電話', key: 'cell', placeholder: '090-1234-5678' },
      { label: 'E-mail', key: 'email' },
      { label: 'Note', key: 'note', multiline: true }
    ]
  }
]
