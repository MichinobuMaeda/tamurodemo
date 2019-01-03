@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Setup login method') }}</div>

        <div class="card-body">
          <h3>{{ __('Hello!') }} {{ $user->name }} {{ __('-san') }}</h3>
          @component('multi_line_message')
            Please select your favorite login method.
          @endcomponent
          @if ($user->email)
            @component('buttons.login_email')
              {{ route('login.email') }}
            @endcomponent
            @component('buttons.login_password')
              {{ route('password.request') }}
            @endcomponent
            <p>{{ __('Please confirm your E-mail address') }}: {{ $user->email }}</p>
            @component('multi_line_message')
              If you want to use another E-mail address, please contact your administrator. 
            @endcomponent
          @else
            @component('multi_line_message')
              If you want to login with E-mail address, please contact your administrator.
            @endcomponent
          @endif
          <p>{{ __('Login with ...') }}</p>
          @component('buttons.login_facebook')
            {{ route('get.registration', [ 'user' => $user, 'token' => $token, 'provider_name' => 'facebook' ]) }}
          @endcomponent
          @component('buttons.login_yahoo_jp')
            {{ route('get.registration', [ 'user' => $user, 'token' => $token, 'provider_name' => 'yahoo_jp' ]) }}
          @endcomponent
          @component('buttons.login_google')
            {{ route('get.registration', [ 'user' => $user, 'token' => $token, 'provider_name' => 'google' ]) }}
          @endcomponent
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
