@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<script>
function restoreDeleted($id, $name) {
  if (window.confirm("{{ __('Restore deleted') }}: " + $name)) {
    window.location.href = "{{ route('group.restoreDeleted', ['idDeleted' => 9999]) }}".replace(/9999/, $id);
  } else {
    return false;
  }
}
function deletePermanently($id, $name) {
  if (window.confirm("{{ __('Delete permanently') }}: " + $name)) {
    window.location.href = "{{ route('group.deletePermanently', ['idDeleted' => 9999]) }}".replace(/9999/, $id);
  } else {
    return false;
  }
}
</script>
<div class="container">
  <div class="row justify-content-center">
    <div class="col-12 col-xl-10">
      <div class="card">
        <div class="card-header">
          @include('layouts.logo')
          {{ __('Group list') }}
        </div>

        <div class="card-body">
          <h5>
            @if($withTrashed)
            <a class="btn btn-link float-right" href="{{ route('groups', ['withTrashed' => 'false'])}}">
              <i class="far fa-check-square"></i>
              {{ __('With Trashed') }}
            </a>
            @else
            <a class="btn btn-link float-right" href="{{ route('groups', ['withTrashed' => 'true'])}}">
              <i class="far fa-square"></i>
              {{ __('With Trashed') }}
            </a>
            @endif
            <div class="text text-secondary">{{ __('Managers only') }}</div>
          </h5>
          <table class="table table-striped table-sm" style="min-width: 720px;">
            <thead>
              <tr>
              <th>
                  <a href="{{ route('groups', ['orderBy' => 'id', 'orderDir' => ($orderBy =='id' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('ID') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('groups', ['orderBy' => 'name', 'orderDir' => ($orderBy =='name' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Display name') }}
                  </a>
                </th>
            </thead>
            <tbody>
            @foreach ($groups as $group)
              <tr>
                <td>
                  {{ $group->id }}
                  </a>
                </td>
                <td>
                @if(!$group->deleted_at)
                  <a href="{{ route('group.edit', ['group' => $group->id]) }}"class="btn btn-outline-primary btn-sm">
                    {{ $group->name }}
                  </a>
                @else
                  <span class="btn btn-outline-secondary btn-sm" href="">
                    <i class="fas fa-minus-circle"></i>
                    {{ $group->name }}
                  </span>
                  <a class="btn btn-outline-secondary btn-sm" href="javascript:restoreDeleted({{ $group->id }}, '{{ $group->name }}');">
                    {{ __('Restore deleted') }}
                  </a>
                  <a class="btn btn-outline-danger btn-sm" href="javascript:deletePermanently({{ $group->id }}, '{{ $group->name }}');">
                    {{ __('Delete permanently') }}
                  </a>
                @endif
                </td>
              </tr>
            @endforeach
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
