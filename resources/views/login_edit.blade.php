@extends('layouts.app')

@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Preferences') }}: {{ __('Login') }}</div>
        <div class="card-body">
          <p>
            <i class="fas fa-envelope"></i>
            <span style="padding-left: 0.5em;">
              {{ Auth::user()->email ? Auth::user()->email : '-- '.__('not set').' --' }}
            <span>
          </p>
          <p>
            <a href="{{ route('get.preferences.login.email') }}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="far fa-envelope"></i>
              </span>
              {{ __('Edit e-mail') }}
            </a>
          </p>
          @if (Auth::user()->email)
          <p>
            <a href="{{ route('get.preferences.login.password')}}" class="btn btn-outline-dark btn-block text-left">
              <span style="font-size: 1.2em; margin: 0 1em 0 0;">
                <i class="fas fa-key"></i>
              </span>
              {{ __('Edit password') }}
            </a>
          </p>
          @endif
<!--
          <p>{{ __('Login with ...') }}</p>
          @if (in_array('facebook', $loginMethods))
            @component('buttons.login_facebook', ['delete' => 'true'])
              {{ '' }}
            @endcomponent
          @else
            @component('buttons.login_facebook')
              {{ '' }}
            @endcomponent
          @endif
          @if (in_array('yahoo_jp', $loginMethods))
            @component('buttons.login_yahoo_jp', ['delete' => 'true'])
              {{ '' }}
            @endcomponent
          @else
            @component('buttons.login_yahoo_jp')
              {{ '' }}
            @endcomponent
          @endif
          @if (in_array('google', $loginMethods))
            @component('buttons.login_google', ['delete' => 'true'])
              {{ '' }}
            @endcomponent
          @else
            @component('buttons.login_google')
              {{ '' }}
            @endcomponent
          @endif
-->
        </div>
     </div>
    </div>
  </div>
</div>
@endsection
