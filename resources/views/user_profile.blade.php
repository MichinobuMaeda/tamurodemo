@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Edit') }}: {{ $user->name }}</div>
        <div class="card-body">
          <form method="POST" action="{{ route('user', ['user' => $user->id]) }}">
            @method('PUT')
            @csrf

            <div class="form-group row">

              <label for="name" class="col-md-3 col-form-label text-md-right">{{ __('Display name') }}</label>
              <p class="col-md-9">
                <input id="name" name="name" type="text" class="form-control{{ $errors->has('name') ? ' is-invalid' : '' }}" value="{{ old('name', $user->name) }}">
                @if ($errors->has('name'))
                  <span class="invalid-feedback" role="alert">
                    <strong>{{ $errors->first('name') }}</strong>
                  </span>
                @endif
              </p>

              <label for="desc" class="col-md-3 col-form-label text-md-right">{{ __('Description') }}</label>
              <p class="col-md-9">
                <textarea
                  id="desc" name="desc" rows="5" maxlength="1000"
                  class="form-control{{ $errors->has('desc') ? ' is-invalid' : '' }}"
                >{{ old('desc', $user->desc) }}</textarea>
              </p>

              <label for="timezone" class="col-md-3 col-form-label text-md-right">{{ __('Time zone') }}</label>
              <p class="col-md-9">
                <select id="timezone" name="timezone" class="form-control{{ $errors->has('timezone') ? ' is-invalid' : '' }}">
                @foreach($vh->timezones() as $tz)
                  <option value="{{ $tz }}"{{ old('timezone', $user->timezone ? $user->timezone : config('tamuro.default_timezone')) == $tz ? ' selected' : '' }}>{{ $tz }}</option>
                @endforeach
                </select>
                @if ($errors->has('timezone'))
                  <span class="invalid-feedback" role="alert">
                    <strong>{{ $errors->first('timezone') }}</strong>
                  </span>
                @endif
              </p>

            </div>
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
      @can('groups.all')
      <div class="card">
        <div class="card-header">
          <a href="{{ route('user.managingGroups', ['user' => $user->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i>
          </a>
          {{ __('Managing groups') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($user->managingGroups()->orderBy('name')->get() as $group)
            <li class="list-inline-item"><a href="{{ route('group', ['group' => $group->id]) }}">
              <i class="fas fa-user-tie" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $group->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endcan
      @can('groups.all')
      <div class="card">
        <div class="card-header">
          <a href="{{ route('user.groups', ['user' => $user->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i>
          </a>
          {{ __('Groups') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($user->groups()->orderBy('name')->get() as $group)
            <li class="list-inline-item"><a href="{{ route('group', ['group' => $group->id]) }}">
              <i class="fas fa-user-friends" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $group->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endcan
      @can('users.delete', $user)
      <div class="card">
        <div class="card-header">
          {{ __('Managers only') }}
        </div>
        <div class="card-body">
          <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteConfirmation-{{ $user->id }}">
            {{ __('Delete') }}
          </button>
          @component('parts.modal_confirm_delete', ['id' => $user->id, 'target' => $user->name])
            {{ route('user', ['user' => $user->id]) }}
          @endcomponent
        </div>
      </div>
      @endcan
    </div>
  </div>
</div>
@endsection
