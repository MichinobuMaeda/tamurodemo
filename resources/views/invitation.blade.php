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
          <p>
            <a href="{{ route('password.request') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="far fa-envelope"></i>
              </span>
              {{ __('E-mail and password') }}
            </a>
          </p>
          <p>{{ __('Please confirm your E-mail address') }}: {{ $user->email }}</p>
            @component('multi_line_message')
              If you want to use another E-mail address, please contact your administrator. 
            @endcomponent
          @else
            @component('multi_line_message')
              If you want to login with E-mail address, please contact your administrator.
            @endcomponent
          @endif
          <p>
            <a href="{{ route('users.invitations', [ 'user' => $user, 'token' => $token, 'provider_name' => 'facebook' ]) }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-facebook"></i>
              </span>
              {{ __('Facebook') }}
            </a>
          </p>
          <p>
            <a href="{{ route('users.invitations', [ 'user' => $user, 'token' => $token, 'provider_name' => 'yahoo_jp' ]) }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0; font-family: 'Wide Latin', Copperplate, serif; font-style: italic;">
                Y!
              </span>
              {{ __('Yahoo! JAPAN') }}
            </a>
          </p>
          <p>
            <a href="{{ route('users.invitations', [ 'user' => $user, 'token' => $token, 'provider_name' => 'google' ]) }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-google"></i>
              </span>
              {{ __('Google') }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
