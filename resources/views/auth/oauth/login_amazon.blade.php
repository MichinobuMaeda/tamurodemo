@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@php
$conf = config('tamuro.oauth_amazon')
@endphp
@section('content')
<div id="amazon-root"></div>
<script>
var state = null;
var action = null;

(function () {
  var url = new URL(window.location.href);
  var code = url.searchParams.get("code");
  var state = url.searchParams.get("state");
  if (code && state) {
    if (state != sessionStorage.getItem('amazon_state')) {
      document.getElementById('amazonStatus').innerText = "{{ __('Failed to authenticate.') }} Error Code: 3001.";
      return
    }
    var action = sessionStorage.getItem('amazon_action');
    var xhr = new XMLHttpRequest();
    if (action == 'login') {
      xhr.open('POST', '{{ route("login.oauth", ["provider" => "amazon"]) }}');
    } else if (action == 'set') {
      xhr.open('POST', '{{ route("preferences.login.oauth", ["provider" => "amazon"]) }}');
    } else {
      xhr.open('POST', '{{ route("register") }}');
    }
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
    xhr.onload = function() {
      if (xhr.responseText == 'ok') {
        document.location = (action == 'set') ? "{{ route('preferences.login') }}" : "{{ route('home') }}";
      } else {
        document.getElementById('amazonStatus').innerText = "{{ __('Failed to authenticate.') }}";
      }
    };
    var redirect_uri = (action == 'set') ? "{{ $conf['redirect_uri2'] }}" : "{{ $conf['redirect_uri1'] }}";
    var provider_token = code + '%09' + redirect_uri;
    if ((action == 'login') || (action == 'set')) {
      xhr.send('provider_token=' + provider_token);
    } else {
      var user =  sessionStorage.getItem('amazon_user');
      xhr.send('provider_token=' + provider_token + "&token=" + state + "&provider_name=amazon&user=" + user);
    }
    sessionStorage.removeItem('amazon_action');
    sessionStorage.removeItem('amazon_state');
    sessionStorage.removeItem('amazon_user');
  } else if (state) {
    document.getElementById('amazonStatus').innerText = "{{ __('Failed to authenticate.') }}";
  }
})();
window.onAmazonLoginReady = function() {
  amazon.Login.setClientId("{{ $conf['client_id'] }}");
};
(function(d) {
  var a = d.createElement('script'); a.type = 'text/javascript';
  a.async = true; a.id = 'amazon-login-sdk';
  a.src = 'https://assets.loginwithamazon.com/sdk/na/login1.js';
  d.getElementById('amazon-root').appendChild(a);
})(document);

if (window.location.href.includes('/login/')) {
  action = 'login';
} else if (window.location.href.includes('/preferences/oauth/')) {
  action = 'set';
} else {
  action = 'registration';
}
sessionStorage.setItem('amazon_action', action);
@if (isset($token))
state = '{{ $token }}';
sessionStorage.setItem('amazon_user', '{{ $user->id }}');
@else
state = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
@endif
sessionStorage.setItem('amazon_state', state);
var redirect_uri = (action == 'set') ? "{{ $conf['redirect_uri2'] }}" : "{{ $conf['redirect_uri1'] }}";

function onClickAmazon() {
  options = { scope: 'profile', response_type: 'code', state: state };
  amazon.Login.authorize(options, redirect_uri);
  return false;
}
</script>
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Yahoo! JAPAN') }}</div>
        <div class="card-body">
          <p>
            <a href="javascript:onClickAmazon();" id="LoginWithAmazon">
              <img style="boder: none;" alt="Login with Amazon"
                src="https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_195x46.png"
                width="195" height="46" />
            </a>
          </p>
          <p id="amazonStatus"></p>
          @component('parts.multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
          @if(Auth::check())
          <p class="text-right">
            <a href="{{ route('preferences.login') }}" class="btn btn-outline-secondary">
              {{ __('Cancel') }}
            </a>
          </p>
          @endif
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
