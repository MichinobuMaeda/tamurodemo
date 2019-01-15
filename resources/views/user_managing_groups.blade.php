@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Edit') }}: {{ $user->name }}</div>
        <div class="card-body">
          <h5>{{ __('Managing groups') }}</h5>
          <form method="POST" action="{{ route('user.managingGroups', ['user' => $user->id]) }}">
            @method('PUT')
            @csrf
            @include('parts.multi_select_list', ['selected' => $selected, 'list' => $list])
            <div class="form-group row mb-0">
              <div class="col-md-9 offset-md-3">
                <button type="submit" class="btn btn-outline-primary">
                  {{ __('Save') }}
                </button>
                <a href="{{ route('page.back') }}" class="btn btn-outline-secondary">
                  {{ __('Exit') }}
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
