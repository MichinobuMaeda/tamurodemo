const initialData = ts => [
  {
    collection: 'service',
    id: 'conf',
    data: {
      version: '0000000',
      name: 'Tamuro',
      hosting: 'https://tamuro01.web.app',
      invitationExpirationTime: 24 * 3600 * 1000,
      notificationExpirationTime: 10 * 24 * 3600 * 1000,
      notificationPauseRepetitionTime: 3 * 3600 * 1000,
      notificationIconPath: '/img/icons/apple-touch-icon-120x120.png',
      profileAddressCount: 3,
      desc: {
        type: 'markdown',
        data: ''
      },
      policy: {
        type: 'markdown',
        data: `
## Headings level 2

### Headings level 3

- list item without number
- list item without number

paragraph paragraph paragraph paragraph paragraph paragraph
paragraph paragraph paragraph paragraph paragraph paragraph.
paragraph paragraph paragraph paragraph paragraph paragraph
paragraph paragraph paragraph paragraph paragraph paragraph.

1. list item with number
2. list item with number
`
      }
    }
  },
  {
    collection: 'service',
    id: 'defaults',
    data: {
      tz: 'Asia/Tokyo',
      locale: 'ja_JP',
      menuPosition: 'br',
      darkTheme: false,
      chatSummaryExpand: true,
      waitProcTimeout: 10 * 1000,
      routeExcludeFromStorage: [
        'invitation',
        'signin',
        'policy',
        'preferences'
      ],
      chatSummaryPaneHeight: '240px',
      chatPaneHeight: '360px',
      hidePrivilegedItems: false,
      messageThumbnailWidth: 128,
      messageThumbnailHeight: 128,
      messageThumbnailQuality: 30,
      messageSummaryLength: 100,
      messageSummaryLines: 4,
      messageSummaryThumbnailCount: 3,
      messageShortenTimestampThreshold: 20 * 3600 * 1000,
      uploadFileCountMax: 100
    }
  },
  {
    collection: 'service',
    id: 'auth',
    data: {
      invitation: true,
      emailLink: true,
      password: true,
      google_com: true,
      apple_com: false,
      facebook_com: false,
      github_com: false,
      microsoft_com: false,
      twitter_com: false,
      line_me: true,
      line_me_grant_type: 'authorization_code',
      line_me_scope: 'profile openid',
      line_me_iss: 'https://access.line.me',
      line_me_auth_url: 'https://access.line.me/oauth2/v2.1/authorize',
      line_me_token_url: 'https://api.line.me/oauth2/v2.1/token',
      yahoo_co_jp: null,
      mixi_jp: null
    }
  },
  {
    collection: 'secrets',
    id: 'auth',
    data: {}
  },
  {
    collection: 'groups',
    id: 'all',
    data: {
      name: 'All members',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'admins',
    data: {
      name: 'System admins',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'managers',
    data: {
      name: 'Managers',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  },
  {
    collection: 'groups',
    id: 'testers',
    data: {
      name: 'Testers',
      desc: {
        type: 'plain',
        data: ''
      },
      members: []
    }
  }
]

module.exports = {
  initialData
}
