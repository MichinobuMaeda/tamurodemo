<div id="fb-root"></div>
<script>(function(d, s, id) {
  facebookArea = true;
  var js, body = d.getElementsByTagName('body')[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v3.2&appId={{ env("FACEBOOK_APP_ID") }}&autoLogAppEvents=1';
  body.insertBefore(js, body.firstChild);
}(document, 'script', 'facebook-jssdk'));</script>
