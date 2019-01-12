@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@php
$conf = config('tamuro.oauth_facebook')
@endphp
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Facebook') }}</div>
        <div class="card-body">
          <div id="fb-root"></div>
<script>
(function(d, s, id) {
  var js, body = d.getElementsByTagName('body')[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/ja_JP/sdk.js#xfbml=1&version=v3.2&appId={{ $conf["app_id"] }}&autoLogAppEvents=1';
  body.insertBefore(js, body.firstChild);
}(document, 'script', 'facebook-jssdk'));

function checkLoginState() {
  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      var token = response.authResponse.accessToken;
      var xhr = new XMLHttpRequest();
      if (window.location.href.includes('/login/')) {
        xhr.open('POST', '{{ route("login.oauth", ["provider" => "facebook"]) }}');
      } else if (window.location.href.includes('/preferences/oauth/')) {
        xhr.open('POST', '{{ route("preferences.login.oauth", ["provider" => "facebook"]) }}');
      } else {
        xhr.open('POST', '{{ route("register") }}');
      }
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
      xhr.onload = function() {
        if (xhr.responseText == 'ok') {
          document.location = window.location.href.includes('/preferences/oauth/') ? "{{ route('preferences.login') }}" : "{{ route('home') }}";
        } else {
          document.getElementById('facebookStatus').innerText = "{{ __('Failed to authenticate.') }}";
        }
      };
      if (window.location.href.includes('/login/') ||
          window.location.href.includes('/preferences/oauth/')) {
        xhr.send('provider_token=' + token);
      } else {
        xhr.send('provider_token=' + token + "&token={{ isset($token) ? $token : "" }}&provider_name=facebook&user={{ isset($user) ? $user->id : "" }}");
      }
    } else {
      document.getElementById('facebookStatus').innerText = "{{ __('Failed to authenticate.') }}";
    }
  });
}
</script>
          <p
            class="fb-login-button"
            data-max-rows="1"
            data-size="large"
            data-button-type="login_with"
            data-show-faces="false"
            data-auto-logout-link="false"
            data-use-continue-as="false"
            scope="public_profile"
            onlogin="checkLoginState();">
          </p>
          <p id="facebookStatus"></p>
          @component('parts.multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
