const names = {
  en: [
    { label: 'First name', key: 'firstName' },
    { label: 'Middle name', key: 'middleName' },
    { label: 'Last name', key: 'lastName' },
    { label: 'Previous name', key: 'previousName' }
  ],
  ja: [
    { label: 'Last name', key: 'lastName' },
    { label: 'First name', key: 'firstName' },
    { label: 'Previous name', key: 'previousName' },
    { label: 'Middle name', key: 'middleName' }
  ]
}

export const locales = [
  {
    text: 'English(US)',
    value: 'en_US',
    lang: 'en',
    names: names.en
  },
  {
    text: '日本語',
    value: 'ja_JP',
    lang: 'ja',
    names: names.ja
  }
]
