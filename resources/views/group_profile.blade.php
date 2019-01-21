@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">{{ __('Edit') }}: {{ $group->name }}</div>
        <div class="card-body">
          <form method="POST" action="{{ route('group', ['group' => $group->id]) }}">
            @method('PUT')
            @csrf

            <div class="form-group row">

              <label for="name" class="col-md-3 col-form-label text-md-right">{{ __('Display name') }}</label>
              <p class="col-md-9">
                <input id="name" name="name" type="text" class="form-control{{ $errors->has('name') ? ' is-invalid' : '' }}" value="{{ old('name', $group->name) }}">
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
                >{{ old('desc', $group->desc) }}</textarea>
              </p>

            </div>
            <div class="form-group row mb-0">
              <div class="col-md-9 offset-md-3">
                <button type="submit" class="btn btn-outline-primary">
                  {{ __('Save') }}
                </button>
                <a href="{{ route('page.back') }}" class="btn btn-outline-secondary">
                  {{ __('Stop') }}
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
      @if(!$group->isPrimary())
      <div class="card">
        <div class="card-header">
          @can('groups.all')
          <a href="{{ route('group.higherGroups', ['group' => $group->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i> {{ __('Edit') }}
          </a>
          @endcan
          {{ __('Higher groups') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($group->higherGroups()->orderBy('name')->get() as $higher)
            <li class="list-inline-item"><a href="{{ route('group', ['group' => $higher->id]) }}">
              <i class="fas fa-users" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $higher->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endif
      @can('groups.all')
      <div class="card">
        <div class="card-header">
          <a href="{{ route('group.subgroups', ['group' => $group->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i> {{ __('Edit') }}
          </a>
          {{ __('Subgroups') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($group->subgroups()->orderBy('name')->get() as $subgroup)
            <li class="list-inline-item"><a href="{{ route('group', ['group' => $subgroup->id]) }}">
              <i class="fas fa-user-friends" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $subgroup->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endcan
      @can('groups.all')
      <div class="card">
        <div class="card-header">
          <a href="{{ route('group.managers', ['group' => $group->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i> {{ __('Edit') }}
          </a>
          {{ __('Managers') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($group->managers()->orderBy('name')->get() as $manager)
            <li class="list-inline-item"><a href="{{ route('user', ['user' => $manager->id]) }}">
              <i class="fas fa-user-tie" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $manager->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endcan
      @can('groups.update', $group)
      <div class="card">
        <div class="card-header">
          <a href="{{ route('group.members', ['group' => $group->id]) }}" class="text-primary float-right" style="background-color:transparent;">
            <i class="fas fa-edit"></i> {{ __('Edit') }}
          </a>
          {{ __('Members') }}
        </div>
        <div class="card-body">
          <ul class="list-inline">
          @foreach($group->members()->orderBy('name')->get() as $member)
            <li class="list-inline-item"><a href="{{ route('user', ['user' => $member->id]) }}">
              <i class="far fa-user" style="margin: 0 0.25em 0 0.5em"></i>
              {{ $member->name }}
            </a></li>
          @endforeach
          </ul>
        </div>
      </div>
      @endcan
      @can('groups.delete', $group)
      <div class="card">
        <div class="card-header">
          {{ __('Managers only') }}
        </div>
        <div class="card-body">
          <button type="button" class="btn btn-danger" data-toggle="modal" data-target="#deleteConfirmation-{{ $group->id }}">
            {{ __('Delete') }}
          </button>
          @component('parts.modal_confirm_delete', ['id' => $group->id, 'target' => $group->name])
            {{ route('group', ['group' => $group->id]) }}
          @endcomponent
        </div>
      </div>
      @endcan
    </div>
  </div>
</div>
@endsection
