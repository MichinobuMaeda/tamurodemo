@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-10">
      <div class="card">
        <div class="card-header">{{ __('Invitation') }}</div>

        <div class="card-body">
          <p><a href="{{ route('users.list') }}">{{ __('Account list') }}</a></p>
          <p>{{ __('Send E-mail to set password.') }}</p>
          <p>{{ $user->name }}</p>
          <p>{{ $user->email }}</p>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
