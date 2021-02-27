import Firebase from 'firebase/app'
import 'firebase/auth'

export const providers = [
  {
    id: 'google.com',
    key: 'google_com',
    type: 'oauth',
    name: 'Google',
    instance: new Firebase.auth.GoogleAuthProvider()
  },
  {
    id: 'apple.com',
    key: 'apple_com',
    type: 'oauth',
    name: 'Apple',
    instance: new Firebase.auth.OAuthProvider('apple.com')
  },
  {
    id: 'facebook.com',
    key: 'facebook_com',
    type: 'oauth',
    name: 'Facebook',
    instance: new Firebase.auth.FacebookAuthProvider()
  },
  {
    id: 'github.com',
    key: 'github_com',
    type: 'oauth',
    name: 'GitHub',
    instance: new Firebase.auth.GithubAuthProvider()
  },
  {
    id: 'microsoft.com',
    key: 'microsoft_com',
    type: 'oauth',
    name: 'Microsoft',
    instance: new Firebase.auth.OAuthProvider('microsoft.com')
  },
  {
    id: 'twitter.com',
    key: 'twitter_com',
    type: 'oauth',
    name: 'Twitter',
    instance: new Firebase.auth.TwitterAuthProvider()
  },
  {
    id: 'line.me',
    key: 'line_me',
    type: 'custom',
    name: 'LINE',
    instance: null,
    params: [
      'grant_type',
      'client_id',
      'client_secret',
      'scope',
      'iss',
      'auth_url',
      'token_url'
    ]
  },
  {
    id: 'yahoo.co.jp',
    key: 'yahoo_co_jp',
    type: 'custom',
    name: 'Yahoo! Japan',
    instance: null
  },
  {
    id: 'mixi.jp',
    key: 'mixi_jp',
    type: 'custom',
    name: 'mixi',
    instance: null
  }
]
