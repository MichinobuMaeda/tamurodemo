@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Preferences') }}: {{ __('Login') }}</div>
        <div class="card-body">
          <h3>{{ $user->name }}</h3>
          <form method="POST" action="{{ route('user.login.email', ['user' => $user->id]) }}">
            @method('PUT')
            @csrf

            <div class="form-group row">
              <label for="email" class="col-md-4 col-form-label text-md-right">{{ __('E-Mail Address') }}</label>

              <div class="col-md-6">
                <input id="email" type="email" class="form-control{{ $errors->has('email') ? ' is-invalid' : '' }}" name="email" value="{{ old('email', $user->email) }}">

                @if ($errors->has('email'))
                  <span class="invalid-feedback" role="alert">
                    <strong>{{ $errors->first('email') }}</strong>
                  </span>
                @endif
              </div>
            </div>

            <div class="form-group row mb-0">
              <div class="col-md-6 offset-md-4">
                <button type="submit" class="btn btn-outline-primary">
                  {{ __('Save') }}
                </button>
                <a href="{{ route('page.back', ['user' => $user->id]) }}" class="btn btn-outline-secondary">
                  {{ __('Cancel') }}
                </a>
              </div>
            </div>
          </form>
          <p>{{ __('Login with ...') }}</p>
          @foreach($vh->getProviders() as $provider)
            @if(in_array($provider, $loginMethods))
              @include('parts.button_login_'.$provider, ['route_reg' => route('user.login.oauth', ['user' => $user->id, 'provider' => $provider]), 'delete' => route('user.login.oauth', ['user' => $user->id, 'provider' => $provider])])
            @endif
          @endforeach
        </div>
     </div>
    </div>
  </div>
</div>
@endsection
