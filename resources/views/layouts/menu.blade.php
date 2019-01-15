@inject('vh', 'App\Services\ViewHelperService')
@guest
  @if (Route::current()->getName() != 'list.logins')
  <a class="btn btn-outline-primary" href="{{ route('list.logins') }}">
    <i class="fas fa-angle-double-left"></i>
    {{ __('Back') }}
  </a>
  @endif
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
      <a class="dropdown-item" href="{{ route('security_policy') }}">
        {{ __('Security policy') }}
      </a>
      <div class="dropdown-divider"></div>
      <a class="dropdown-item" href="{{ route('preferences.login') }}">
        {{ __('Preferences') }}: {{ __('Login') }}
      </a>
      <a class="dropdown-item" href="{{ route('user.edit', ['user' => Auth::user()->id]) }}">
        {{ __('Preferences') }}: {{ __('Profile') }}
      </a>
    @can('groups.create')
      <a class="dropdown-item" href="{{ route('group.create.form') }}">
        {{ __('Create') }}: {{ __('Group') }}
      </a>
    @endcan
    @can('users.create')
      <a class="dropdown-item" href="{{ route('user.create.form') }}">
        {{ __('Create') }}: {{ __('User') }}
      </a>
    @endcan
    @can('users.list')
      <a class="dropdown-item" href="{{ route('users') }}">
        {{ __('User list') }}
      </a>
    @endcan
    @can('system.administrate')
      <a class="dropdown-item" href="{{ route('sysadmin') }}">
        {{ __('System administration') }}
      </a>
    @endcan
    </div>
  </div>
@endguest
