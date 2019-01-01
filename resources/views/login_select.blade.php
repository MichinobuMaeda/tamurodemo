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
            <button type="button" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fas fa-exchange-alt"></i>
              </span>
              {{ __('E-mail confirmation') }}
            </button>
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
          <p id="facebookArea" style="display: none;">
            <a href="{{ route('login_facebook') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-facebook"></i>
              </span>
              {{ __('Facebook') }}
            </a>
          </p>
<!-- TODO:
          <p>
            <button type="button" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0; font-family: 'Wide Latin', Copperplate, serif; font-style: italic;">
                Y!
              </span>
              {{ __('Yahoo! JAPAN') }}
            </button>
          </p>
          <p>
            <button type="button" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0; font-family: Geneva, 'Lucida Console', Arial, sans-serif";>
                m
              </span>
              {{ __('mixi') }}
            </button>
          </p>
          <p>
            <button type="button" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fab fa-microsoft"></i>
              </span>
              {{ __('Microsoft') }}
            </button>
          </p>
-->
          <p id="googleArea" style="display: none;">
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
<script>
  document.getElementById("facebookArea").style.display = facebookArea ? "block" : "none";
  document.getElementById("googleArea").style.display = googleArea ? "block" : "none";
</script>
@endsection
