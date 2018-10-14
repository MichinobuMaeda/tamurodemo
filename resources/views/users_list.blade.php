@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-10">
      <div class="card">
        <div class="card-header">{{ __('Account list') }}</div>

        <div class="card-body">
          <table class="table table-striped table-sm">
            <thead>
              <tr>
                <th>
                  <a href="{{ route('users.list.orderBy', ['orderBy' => 'name', 'orderDir' => ($orderBy =='name' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Display name') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users.list.orderBy', ['orderBy' => 'email', 'orderDir' => ($orderBy =='email' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('E-mail') }}
                  </a>
                </th>
                <th>
                  <a href="{{ route('users.list.orderBy', ['orderBy' => 'last_login_at', 'orderDir' => ($orderBy =='last_login_at' && $orderDir == 'asc' ? 'desc' : 'asc')]) }}">
                    <i class="fas fa-sort"></i>
                    {{ __('Last login') }}
                  </a>
                </th>
                <th>
                </th>
              </tr>
            </thead>
            <tbody>
            @foreach ($users as $user)
              <tr>
                <td>
                  {{ $user->name }}
                </td>
                <td>
                @if (preg_match("/.+@.+\..+/", $user->email))
                  {{ $user->email }}
                @endif
                </td>
                <td>
                  {{ $vh->formatTimestamp($user->last_login_at) }}
                </td>
                <td>
                @if (preg_match("/.+@.+\..+/", $user->email))
                  <form method="POST" action="{{ route('users.invite', ['user'=>$user->id]) }}"> 
                    @csrf                   
                    <button type="submit" name="provider" value="email" class='btn btn-sm' style='background-color:transparent;'>
                      <i class="fas fa-envelope"></i>
                    </button>
                  </form>
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
