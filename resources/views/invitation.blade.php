@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      @include('parts.security_notification')
      <div class="card">
        <div class="card-header">{{ __('Setup login method') }}</div>

        <div class="card-body">
          <h3>{{ __('Hello!') }} {{ $user->name }} {{ __('-san') }}</h3>
          @component('parts.multi_line_message')
            Please select your favorite login method.
          @endcomponent
          @if ($user->email)
            @component('parts.button_login_email')
              {{ route('login.email') }}
            @endcomponent
            @component('parts.button_login_password')
              {{ route('password.request') }}
            @endcomponent
            <p>{{ __('Please confirm your E-mail address') }}: {{ $user->email }}</p>
            @component('parts.multi_line_message')
              If you want to use another E-mail address, please contact your administrator. 
            @endcomponent
          @else
            @component('parts.multi_line_message')
              If you want to login with E-mail address, please contact your administrator.
            @endcomponent
          @endif
          <p>{{ __('Login with ...') }}</p>
          @include('parts.button_login_facebook', ['route_reg' => route('registration', ['user' => $user, 'token' => $token, 'provider_name' => 'facebook'])])
          @include('parts.button_login_yahoo_jp', ['route_reg' => route('registration', ['user' => $user, 'token' => $token, 'provider_name' => 'yahoo_jp'])])
          @include('parts.button_login_amazon',   ['route_reg' => route('registration', ['user' => $user, 'token' => $token, 'provider_name' => 'amazon'  ])])
          @include('parts.button_login_google',   ['route_reg' => route('registration', ['user' => $user, 'token' => $token, 'provider_name' => 'google'  ])])
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
