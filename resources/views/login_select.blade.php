@extends('layouts.app')

@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      @include('security_notification')
      <div class="card">
        <div class="card-header">{{ __('Login') }}</div>
        <div class="card-body">
          @component('multi_line_message')
            Please select the login method which you've registered.
          @endcomponent
          @component('buttons.login_email')
            {{ route('login.email') }}
          @endcomponent
          @component('buttons.login_password')
            {{ route('login') }}
          @endcomponent
          <p>{{ __('Login with ...') }}</p>
          @component('buttons.login_facebook')
            {{ route('login.facebook') }}
          @endcomponent
          @component('buttons.login_yahoo_jp')
            {{ route('login.yahoo_jp') }}
          @endcomponent
          @component('buttons.login_google')
            {{ route('login.google') }}
          @endcomponent
        </div>
     </div>
    </div>
  </div>
</div>
@endsection
