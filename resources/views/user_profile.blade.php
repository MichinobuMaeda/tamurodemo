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
              <label for="name" class="col-md-3 col-form-label text-md-right">{{ __('Description') }}</label>
              <p class="col-md-9">
                <textarea
                  id="desc" name="desc" rows="5" maxlength="1000"
                  class="form-control{{ $errors->has('desc') ? ' is-invalid' : '' }}"
                >{{ old('desc', $user->desc) }}</textarea>
                @if ($errors->has('desc'))
                  <span class="invalid-feedback" role="alert">
                    <strong>{{ $errors->first('desc') }}</strong>
                  </span>
                @endif
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
                  {{ __('Cancel') }}
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
