import Firebase from 'firebase'

// Set true or false.
export default {
  emailLink: true && 'email',
  password: true && 'password',
  google: false && Firebase.auth.GoogleAuthProvider,
  facebook: false && Firebase.auth.FacebookAuthProvider,
  twitter: true && Firebase.auth.TwitterAuthProvider,
  github: false && Firebase.auth.GithubAuthProvider,
  // microsoft: false && 'microsoft.com',
  line: true && 'line.me'
  // yahoojp: false && 'yahoo.co.jp',
  // mixi: false && 'mixi.jp'
}
