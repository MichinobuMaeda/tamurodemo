<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- CSRF Token -->
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <title>{{ config('app.name', 'Tamuro') }}</title>

  <!-- Scripts -->
  <script src="{{ asset('js/app.js') }}" defer></script>

  <!-- Fonts -->
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">

  <!-- Styles -->
  <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
  <div id="app" style="padding-bottom: 32px;">
    <main class="py-4">
      @yield('content')
    </main>
    <div class="fixed-bottom" style="padding: 4px; text-align: right;">
    @guest
      <a class="btn btn-secondary" href="{{ route('list.logins') }}">{{ __('Login') }}</a>
    @else
      <div class="btn-group dropup">
        <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {{ Auth::user()->name }}
        </button>
        <div class="dropdown-menu">
          <a class="dropdown-item" href="{{ route('logout') }}"
              onclick="event.preventDefault();
                    document.getElementById('logout-form').submit();">
            {{ __('Logout') }}
          </a>
          <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
            @csrf
          </form>
          <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="{{ route('preferences.login') }}">
              {{ __('Preferences') }}: {{ __('Login') }}
            </a>
        @can('users.list')
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="{{ route('list.users') }}">
            {{ __('Account list') }}
          </a>
        @endcan
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="{{ route('home') }}">
            {{ __('Top page') }}
          </a>
        </div>
      </div>
    @endguest
    </div>
  </div>
</body>
</html>
