@extends('layouts.app')

@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Login') }}</div>
        <div class="card-body">
        @component('multi_line_message')
          Please select the login method which you've registered.
        @endcomponent
<!-- TODO:
          <p>
            <a href="{{ route('login') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fas fa-exchange-alt"></i>
              </span>
              {{ __('E-mail confirmation') }}
            </a>
          </p>
-->
          <p>
            <a href="{{ route('login') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="far fa-envelope"></i>
              </span>
              {{ __('E-mail and password') }}
            </a>
          </p>
          <p>{{ __('Login with ...') }}</p>
          <p>
            <a href="{{ route('login_facebook') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-facebook"></i>
              </span>
              {{ __('Facebook') }}
            </a>
          </p>
          <p>
            <a href="{{ route('login_yahoo_jp') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0; font-family: 'Wide Latin', Copperplate, serif; font-style: italic;">
                Y!
              </span>
              {{ __('Yahoo! JAPAN') }}
            </a>
          </p>
<!-- TODO:
          <p>
            <a href="{{ route('login_facebook') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0; font-family: Geneva, 'Lucida Console', Arial, sans-serif";>
                m
              </span>
              {{ __('mixi') }}
            </a>
          </p>
          <p>
            <a href="{{ route('login_facebook') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-amazon_jp"></i>
              </span>
              {{ __('amazon.co.jp') }}
            </a>
          </p>
          <p>
            <a href="{{ route('login_facebook') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-microsoft"></i>
              </span>
              {{ __('Microsoft') }}
            </a>
          </p>
-->
          <p>
            <a href="{{ route('login_google') }}" class="btn btn-outline-dark btn-block text-left">
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
