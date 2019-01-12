@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      @include('parts.security_notification')
      <div class="card">
        <div class="card-header">{{ __('Login') }}</div>
        <div class="card-body">
          @component('parts.multi_line_message')
            Please select the login method which you've registered.
          @endcomponent
          @component('parts.button_login_email')
            {{ route('login.email') }}
          @endcomponent
          @component('parts.button_login_password')
            {{ route('login') }}
          @endcomponent
          <p>{{ __('Login with ...') }}</p>
          @include('parts.button_login_facebook', ['route_reg' => route('login.oauth', ['provider' => 'facebook'])])
          @include('parts.button_login_yahoo_jp', ['route_reg' => route('login.oauth', ['provider' => 'yahoo_jp'])])
          @include('parts.button_login_amazon',   ['route_reg' => route('login.oauth', ['provider' => 'amazon'])  ])
          @include('parts.button_login_google',   ['route_reg' => route('login.oauth', ['provider' => 'google'])  ])
        </div>
     </div>
    </div>
  </div>
</div>
@endsection
