@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Yahoo! JAPAN') }}</div>
        <div class="card-body">
          <p>
            <a href="javascript:window.history.back();">
              <i class="fas fa-angle-double-left"></i>
              {{ __('Back') }}
            </a>
          </p>
          <span class="yconnectLogin"></span>
<script type="text/javascript">

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
      xhr.open('POST', '{{ route("oAuthLogin") }}');
    } else {
      xhr.open('POST', '{{ route("post.registration") }}');
    }
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
    xhr.onload = function() {
      if (xhr.responseText == 'ok') {
        document.location = "{{ route('home') }}";
      } else {
        document.getElementById('yahooJpStatus').innerText = "{{ __('Failed to authenticate.') }}";
      }
    };
    if (action == 'login') {
      xhr.send('provider_token=' + code + '%09' + nonce + "&provider_name=yahoo_jp");
    } else {
      var user =  sessionStorage.getItem('yahoo_jp_user');
      xhr.send('provider_token=' + code + '%09' + nonce + "&token=" + state + "&provider_name=yahoo_jp&user=" + user);
    }
    sessionStorage.removeItem('yahoo_jp_action');
    sessionStorage.removeItem('yahoo_jp_state');
    sessionStorage.removeItem('yahoo_jp_nonce');
    sessionStorage.removeItem('yahoo_jp_user');
  }
})();

@if (isset($token))
var state = '{{ $token }}';
sessionStorage.setItem('yahoo_jp_action', 'registration');
sessionStorage.setItem('yahoo_jp_user', '{{ $user->id }}');
@else
var state = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
sessionStorage.setItem('yahoo_jp_action', 'login');
@endif
sessionStorage.setItem('yahoo_jp_state', state);
var nonce = Math.random().toString(36).substr(2, 16) + Math.random().toString(36).substr(2, 16);
sessionStorage.setItem('yahoo_jp_nonce', nonce);

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
      clientId: "{{ env('YAHOO_JP_CLIENT_ID') }}",
      redirectUri: "{{ env('YAHOO_JP_REDIRECT_URI') }}",
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
          @component('multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
