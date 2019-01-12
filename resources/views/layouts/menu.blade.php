@inject('vh', 'App\Services\ViewHelperService')
@guest
  <a class="btn btn-secondary" href="javascript:window.history.back();">
    <i class="fas fa-angle-double-left"></i>
    {{ __('Back') }}
  </a>
@else
  <a href="{{ route('home') }}" class="btn btn-outline-success btn-sm text-success" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-home"></i>
  </a>
  @if($vh->IsPagePrev(request()->session()))
  <a href="{{ route('page.back') }}" class="btn btn-outline-success btn-sm text-success" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-left"></i>
  </a>
  @else
  <a href="#" class="btn btn-light btn-sm text-white" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-left"></i>
  </a>
  @endif
  @if($vh->IsPageNext(request()->session()))
  <a href="{{ route('page.forward') }}" class="btn btn-outline-success btn-sm text-success" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-right"></i>
  </a>
  @else
  <a href="#" class="btn btn-light btn-sm text-white" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-right"></i>
  </a>
  @endif
  <div class="btn-group drop{{ $dir }}">
    <button type="button" class="btn btn-outline-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
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
      <a class="dropdown-item" href="{{ route('user.edit', ['user' => Auth::user()->id]) }}">
        {{ __('Preferences') }}: {{ __('Profile') }}
      </a>
    @can('users.list')
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="{{ route('users') }}">
        {{ __('Account list') }}
      </a>
    @endcan
    </div>
  </div>
@endguest
