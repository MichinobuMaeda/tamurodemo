@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@php
$conf = config('tamuro.oauth_yahoo_jp')
@endphp
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Yahoo! JAPAN') }}</div>
        <div class="card-body">
          <span class="yconnectLogin"></span>
<script>
var state = null;
var nonce = null;
var action = null;

(function () {
  var url = new URL(window.location.href);
  var code = url.searchParams.get("code");
  var state = url.searchParams.get("state");
  if (code && state) {
    if (state != sessionStorage.getItem('yahoo_jp_state')) {
      document.getElementById('yahooJpStatus').innerText = "{{ __('Failed to authenticate.') }} Error Code: 3001.";
      return
    }
    var action = sessionStorage.getItem('yahoo_jp_action');
    var nonce = sessionStorage.getItem('yahoo_jp_nonce');
    var xhr = new XMLHttpRequest();
    if (action == 'login') {
      xhr.open('POST', '{{ route("login.oauth", ["provider" => "yahoo_jp"]) }}');
    } else if (action == 'set') {
      xhr.open('POST', '{{ route("preferences.login.oauth", ["provider" => "yahoo_jp"]) }}');
    } else {
      xhr.open('POST', '{{ route("register") }}');
    }
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
    xhr.onload = function() {
      if (xhr.responseText == 'ok') {
        document.location = (action == 'set') ? "{{ route('preferences.login') }}" : "{{ route('home') }}";
      } else {
        document.getElementById('yahooJpStatus').innerText = "{{ __('Failed to authenticate.') }}";
      }
    };
    var redirect_uri = (action == 'set') ? "{{ $conf['redirect_uri2'] }}" : "{{ $conf['redirect_uri1'] }}";
    var provider_token = code + '%09' + nonce + '%09' + redirect_uri;
    if ((action == 'login') || (action == 'set')) {
      xhr.send('provider_token=' + provider_token);
    } else {
      var user =  sessionStorage.getItem('yahoo_jp_user');
      xhr.send('provider_token=' + provider_token + "&token=" + state + "&provider_name=yahoo_jp&user=" + user);
    }
    sessionStorage.removeItem('yahoo_jp_action');
    sessionStorage.removeItem('yahoo_jp_state');
    sessionStorage.removeItem('yahoo_jp_nonce');
    sessionStorage.removeItem('yahoo_jp_user');
  } else if (state) {
    document.getElementById('amazonStatus').innerText = "{{ __('Failed to authenticate.') }}";
  }
})();

if (window.location.href.includes('/login/')) {
  action = 'login';
} else if (window.location.href.includes('/preferences/oauth/')) {
  action = 'set';
} else {
  action = 'registration';
}
sessionStorage.setItem('yahoo_jp_action', action);
@if (isset($token))
state = '{{ $token }}';
sessionStorage.setItem('yahoo_jp_user', '{{ $user->id }}');
@else
state = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
@endif
sessionStorage.setItem('yahoo_jp_state', state);
nonce = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
sessionStorage.setItem('yahoo_jp_nonce', nonce);
var redirect_uri = (action == 'set') ? "{{ $conf['redirect_uri2'] }}" : "{{ $conf['redirect_uri1'] }}";

window.yconnectInit = function() {
  YAHOO.JP.yconnect.Authorization.init({
    button: {
      format: "image",
      type: "a",
      textType:"a",
      width: 260,
      height: 50,
      className: "yconnectLogin"
    },
    authorization: {
      clientId: "{{ $conf['client_id'] }}",
      redirectUri: redirect_uri,
      scope: "openid",
      responseType: "code",
      state: state,
      nonce: nonce,
      windowWidth: "500",
      windowHeight: "400"
    },
    onError: function(res) {
      document.getElementById('yahooJpStatus').innerText = "{{ __('Failed to authenticate.') }} Error Code: 3002.";
    },
    onCancel: function(res) {
      document.getElementById('yahooJpStatus').innerText = "{{ __('Failed to authenticate.') }} Error Code: 3003.";
    }
  });
};

(function(){
var body = document.getElementsByTagName("body")[0], s = document.createElement("script");
s.setAttribute("src", "https://s.yimg.jp/images/login/yconnect/auth/2.0.1/auth-min.js");
body.insertBefore(s, body.firstChild);
})();
</script>
         <p id="yahooJpStatus"></p>
          @component('parts.multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
