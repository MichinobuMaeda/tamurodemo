  <script src="https://apis.google.com/js/api:client.js"></script>
  <script>
  var startGoogleApp = function() {
    gapi.load('auth2', function(){
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      auth2 = gapi.auth2.init({
        client_id: '{{ env("GOOGLE_CLIENT_ID") }}',
        cookiepolicy: 'single_host_origin',
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      auth2.attachClickHandler(
        document.getElementById('googleButton'),
        {},
        function(googleUser) {
          var id_token = googleUser.getAuthResponse().id_token;
          var xhr = new XMLHttpRequest();
        @if (isset($invited))
          xhr.open('POST', '{{ route("post.registration", ["user" => $user->id]) }}');
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
          xhr.onload = function() {
            if (xhr.responseText == 'ok') {
              document.location = "{{ url('/') }}";
            } else {
              document.getElementById('googleStatus').innerText = "{{ __('Failed to authenticate.') }}";
            }
          };
          xhr.send('provider_token=' + id_token + "&token={{ $token }}&provider_name=google");
        @else
          xhr.open('POST', '{{ route("oAuthLogin") }}');
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
          xhr.onload = function() {
            if (xhr.responseText == 'ok') {
              document.location = "{{ url('/') }}";
            } else {
              document.getElementById('googleStatus').innerText = "{{ __('Failed to authenticate.') }}";
            }
          };
          xhr.send('provider_token=' + id_token + "&provider_name=google");
        @endif
        }, function(error) {
          alert(JSON.stringify(error, undefined, 2));
        }
      );
    });
  };
  </script>
