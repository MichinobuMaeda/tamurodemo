@php
  $invited = true
@endphp
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
          <p>{{ __('Please setup your login method.') }}</p>
          @if ($user->email)
          <p>
            <a class="btn btn-email" href="{{ route('password.request') }}">
              {{ __('E-mail address and password') }}
            </a>
          </p>
          <p>{{ __('Please confirm your E-mail address') }}: {{ $user->email }}</p>
          <p>{{ __('If you want to use another E-mail address, please ask the system administrator to set up the mail address.') }}</p>
          @else
          <p>{{ __('If you want to login with E-mail and password, please ask the system administrator to set up the mail address.') }}</p>
          @endif
          <p>
            <div id="googleSignInWrapper">
              <div id="googleButton" class="btn btn-google">
                <span class="icon"></span>
                <span class="buttonText">{{ __('Login with Google') }}</span>
              </div>
            </div>
            <p id="googleStatus"></p>
            <script>startGoogleApp();</script>
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
