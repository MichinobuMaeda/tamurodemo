@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-12 col-xl-10">
      <div class="card">
        <div class="card-header">{{ __('Account list') }}</div>

        <div class="card-body">
          <table class="table table-striped table-sm" style="min-width: 720px;">
            <thead>
              <tr>
              <th>
                  <a href="{{ route('users.orderBy', ['orderBy' => 'id', 'orderDir' => ($orderBy =='id' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('ID') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users.orderBy', ['orderBy' => 'name', 'orderDir' => ($orderBy =='name' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Display name') }}
                  </a>
                </th>
                <th>
                  {{ __('Login method') }}
                </th>
                <th>
                  <a href="{{ route('users.orderBy', ['orderBy' => 'invited_at', 'orderDir' => ($orderBy =='invited_at' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Invitation') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users.orderBy', ['orderBy' => 'entered_at', 'orderDir' => ($orderBy =='entered_at' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
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
                </td>
                <td>
                  {{ $user->name }}
                </td>
                <td>
                  <a href="{{ route('user.login', ['user' => $user->id]) }}"class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-envelope {{ $user->email ? '' : 'text-white' }}"></i>
                    <i class="fab fa-facebook {{ in_array(''.$user->id."\t".'facebook', $loginMethods) ? '' : 'text-white' }}"></i>
                    <span class="{{ in_array(''.$user->id."\t".'yahoo_jp', $loginMethods) ? '' : 'text-white' }}">Y!</span>
                    <i class="fab fa-amazon {{ in_array(''.$user->id."\t".'amazon', $loginMethods) ? '' : 'text-white' }}"></i>
                    <i class="fab fa-google {{ in_array(''.$user->id."\t".'google', $loginMethods) ? '' : 'text-white' }}"></i>
                  </a>
                </td>
                <td>
                  @if (($user->invited_at))
                  <a href="{{ route('invitation', ['user' => $user->id, 'sendBy' => 'message']) }}">
                    {{ $vh->formatTimestamp($user->invited_at) }}
                  </a>
                  @endif
                </td>
                <td>
                  {{ $vh->formatTimestamp($user->entered_at) }}
                </td>
                <td>
                  <a class='btn btn-outline-primary btn-sm' href="{{ route('invite', ['user'=>$user->id, 'sendBy' => 'message']) }}" style="margin-right: 1em;">
                    <i class="fas fa-comment"></i>
                  </a>
                  @if ($user->email)
                  <a class='btn btn-outline-primary btn-sm' href="{{ route('invite', ['user'=>$user->id, 'sendBy' => 'email']) }}">
                    <i class="far fa-envelope"></i>
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
