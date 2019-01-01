<script src="https://apis.google.com/js/platform.js" async defer></script>
<script>
  googleArea = true;
  var googleAuth2 = null;
  var initGoogleClient = function() {
    gapi.load('auth2', function(){
      googleAuth2 = gapi.auth2.init({
        client_id: '{{ env("GOOGLE_CLIENT_ID") }}',
        cookiepolicy: 'single_host_origin',
        scope: 'profile',
      });
    });
  };
</script>
