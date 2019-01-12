@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-10">
      <div class="card">
        <div class="card-header">{{ __('Invitation') }}</div>

        <div class="card-body">
          <p>
            <a class="btn btn-outline-primary" href="{{ route('users') }}">
              <i class="fas fa-angle-double-left"></i> 
              {{ __('Account list') }}
            </a>
          </p>
          <p>{{ $user->name }}</p>
          @if ($sendBy == 'email')
          <p>{{ __('Send E-mail to set password.') }}</p>
          <p>{{ $user->email }}</p>
          @else
          <p>{{ route('registration', [ 'user' => $user->id, 'token' => $user->invitation_token ]) }}</p>
          @endif
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
