@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login with Facebook') }}</div>
        <div class="card-body">
          <p>
            <a href="javascript:window.history.back();">
              <i class="fas fa-angle-double-left"></i>
              {{ __('Back') }}
            </a>
          </p>
          <script>
            function checkLoginState() {
              FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                  var token = response.authResponse.accessToken;
                  var xhr = new XMLHttpRequest();
                  if (window.location.href.includes('/login/')) {
                    xhr.open('POST', '{{ route("oAuthLogin") }}');
                  } else {
                    xhr.open('POST', '{{ route("post.registration", [ "user" => isset($user) ? $user : null ]) }}');
                  }
                  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                  xhr.setRequestHeader('X-CSRF-TOKEN', '{{ csrf_token() }}');
                  xhr.onload = function() {
                    if (xhr.responseText == 'ok') {
                      document.location = "{{ route('home') }}";
                    } else {
                      document.getElementById('facebookStatus').innerText = "{{ __('Failed to authenticate.') }}";
                    }
                  };
                  if (window.location.href.includes('/login/')) {
                    xhr.send('provider_token=' + token + "&provider_name=facebook");
                  } else {
                    xhr.send('provider_token=' + token + "&token={{ isset($token) ? $token : "" }}&provider_name=facebook");
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
          @component('multi_line_message')
            If you have any troubles, please contact your administrator.
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
