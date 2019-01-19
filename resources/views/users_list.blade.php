@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<script>
function restoreDeleted($id, $name) {
  if (window.confirm("{{ __('Restore deleted') }}: " + $name)) {
    window.location.href = "{{ route('user.restoreDeleted', ['idDeleted' => 9999]) }}".replace(/9999/, $id);
  } else {
    return false;
  }
}
function deletePermanently($id, $name) {
  if (window.confirm("{{ __('Delete permanently') }}: " + $name)) {
    window.location.href = "{{ route('user.deletePermanently', ['idDeleted' => 9999]) }}".replace(/9999/, $id);
  } else {
    return false;
  }
}
</script>
<div class="container">
  <div class="row justify-content-center">
    <div class="col-12 col-xl-10">
      <div class="card">
        <div class="card-header">{{ __('User list') }}</div>

        <div class="card-body">
          <h5>
            @if($withTrashed)
            <a class="btn btn-link float-right" href="{{ route('users', ['withTrashed' => 'false'])}}">
              <i class="far fa-check-square"></i>
              {{ __('With Trashed') }}
            </a>
            @else
            <a class="btn btn-link float-right" href="{{ route('users', ['withTrashed' => 'true'])}}">
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
                  <a href="{{ route('users', ['orderBy' => 'id', 'orderDir' => ($orderBy =='id' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('ID') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users', ['orderBy' => 'name', 'orderDir' => ($orderBy =='name' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Display name') }}
                  </a>
                </th>
                <th>
                  {{ __('Login method') }}
                </th>
                <th>
                  <a href="{{ route('users', ['orderBy' => 'invited_at', 'orderDir' => ($orderBy =='invited_at' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Invitation') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users', ['orderBy' => 'entered_at', 'orderDir' => ($orderBy =='entered_at' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Entrance') }}
                  </a>
                </th>
                <th>
                  {{ __('Invite') }}
                </th>
              </tr>
            </thead>
            <tbody>
            @foreach ($users as $user)
              <tr>
                <td>
                  {{ $user->id }}
                  </a>
                </td>
                <td>
                @if(!$user->deleted_at)
                  <a href="{{ route('user.edit', ['user' => $user->id]) }}"class="btn btn-outline-primary btn-sm">
                    {{ $user->name }}
                  </a>
                @else
                  <span class="btn btn-outline-secondary btn-sm" href="">
                    <i class="fas fa-minus-circle"></i>
                    {{ $user->name }}
                  </span>
                @endif
                </td>
                <td>
                @if(!$user->deleted_at)
                  <a href="{{ route('user.login', ['user' => $user->id]) }}"class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-envelope {{ $user->email ? '' : 'text-white' }}"></i>
                    <i class="fab fa-facebook {{ in_array(''.$user->id."\t".'facebook', $loginMethods) ? '' : 'text-white' }}"></i>
                    <span class="{{ in_array(''.$user->id."\t".'yahoo_jp', $loginMethods) ? '' : 'text-white' }}">Y!</span>
                    <i class="fab fa-amazon {{ in_array(''.$user->id."\t".'amazon', $loginMethods) ? '' : 'text-white' }}"></i>
                    <i class="fab fa-google {{ in_array(''.$user->id."\t".'google', $loginMethods) ? '' : 'text-white' }}"></i>
                  </a>
                @endif
                </td>
                <td>
                @if(!$user->deleted_at)
                  @if (($user->invited_at))
                  <a href="{{ route('invitation', ['user' => $user->id, 'sendBy' => 'message']) }}">
                    {{ $vh->formatTimestamp($user->invited_at) }}
                  </a>
                  @endif
                @else
                  <a class="btn btn-outline-secondary btn-sm" href="javascript:restoreDeleted({{ $user->id }}, '{{ $user->name }}');">
                    {{ __('Restore deleted') }}
                  </a>
                @endif
                </td>
                <td>
                @if(!$user->deleted_at)
                  {{ $vh->formatTimestamp($user->entered_at) }}
                @else
                  <a class="btn btn-outline-danger btn-sm" href="javascript:deletePermanently({{ $user->id }}, '{{ $user->name }}');">
                    {{ __('Delete permanently') }}
                  </a>
                @endif
                </td>
                <td>
                @if(!$user->deleted_at)
                  <a class='btn btn-outline-primary btn-sm' href="{{ route('invite', ['user'=>$user->id, 'sendBy' => 'message']) }}" style="margin-right: 1em;">
                    <i class="fas fa-comment"></i>
                  </a>
                  @if ($user->email)
                  <a class='btn btn-outline-primary btn-sm' href="{{ route('invite', ['user'=>$user->id, 'sendBy' => 'email']) }}">
                    <i class="far fa-envelope"></i>
                  </a>
                  @endif
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
