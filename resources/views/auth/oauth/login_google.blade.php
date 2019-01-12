@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@php
$conf = config('tamuro.oauth_google')
@endphp
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Google') }}</div>
        <div class="card-body">
<script>
var googleAuth2 = null;
var onGoogleLoad = function() {
  gapi.load('auth2', () => {
    googleAuth2 = gapi.auth2.init({
      client_id: '{{ $conf["client_id"] }}',
      cookiepolicy: 'single_host_origin',
      scope: 'profile',
    }).then(() => {
      gapi.signin2.render(
        'googleSinginButton',
        {
          scope: 'profile',
          width: 220,
          height: 40,
          longtitle: true,
          theme: 'light',
          onsuccess: onSignIn,
          onfailure: null
        }
      );
    });
  });
};
function onSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  var xhr = new XMLHttpRequest();
  if (window.location.href.includes('/login/')) {
    xhr.open('POST', '{{ route("login.oauth", ["provider" => "google"]) }}');
  } else if (window.location.href.includes('/preferences/oauth/')) {
    xhr.open('POST', '{{ route("preferences.login.oauth", ["provider" => "google"]) }}');
  } else {
    xhr.open('POST', '{{ route("register") }}');
  }
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
  xhr.onload = function() {
    if (xhr.responseText == 'ok') {
      document.location = window.location.href.includes('/preferences/oauth/') ? "{{ route('preferences.login') }}" : "{{ route('home') }}";
    } else {
      document.getElementById('googleStatus').innerText = "{{ __('Failed to authenticate.') }}";
    }
  };
  if (window.location.href.includes('/login/') ||
      window.location.href.includes('/preferences/oauth/')) {
    xhr.send('provider_token=' + id_token);
  } else {
    xhr.send('provider_token=' + id_token + '&token={{ isset($token) ? $token : "" }}&provider_name=google&user={{ isset($user) ? $user->id : "" }}');
  }
}
</script>
<script src="https://apis.google.com/js/platform.js?onload=onGoogleLoad" async defer></script>
          <p id="googleSinginButton"></p>
          <p id="googleStatus"></p>
          @component('parts.multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
