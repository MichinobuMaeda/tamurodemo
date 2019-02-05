@inject('vh', 'App\Services\ViewHelperService')
@guest
  @if (Route::current()->getName() != 'list.logins')
  <a class="btn btn-outline-primary" href="{{ route('list.logins') }}">
    <i class="fas fa-angle-double-left"></i>
    {{ __('Back') }}
  </a>
  @endif
@else
  @if($vh->IsPagePrev(request()->session()))
  <a href="{{ route('page.back') }}" class="btn btn-success btn-sm text-white" style="margin-right: 1em;">
    <i class="fas fa-arrow-left"></i>
  </a>
  @else
  <a href="#" class="btn btn-light btn-sm text-white" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-left"></i>
  </a>
  @endif
  @if($vh->IsPageNext(request()->session()))
  <a href="{{ route('page.forward') }}" class="btn btn-success btn-sm text-white" style="margin-right: 1em;">
    <i class="fas fa-arrow-right"></i>
  </a>
  @else
  <a href="#" class="btn btn-light btn-sm text-white" style="background-color:transparent; margin-right: 1em;">
    <i class="fas fa-arrow-right"></i>
  </a>
  @endif
  <div class="btn-group drop{{ $dir }}">
    <button type="button" class="btn btn-success dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      {{ __('Menu') }}
    </button>
    <div class="dropdown-menu">
      <a class="dropdown-item" href="{{ route('logout') }}"
          onclick="event.preventDefault();
                document.getElementById('logout-form').submit();">
        <i class="fas fa-power-off" style="margin-right: 0.25em;"></i>
        {{ __('Logout') }}
      </a>
      <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
        @csrf
      </form>
      <a class="dropdown-item" href="{{ route('user.edit', ['user' => Auth::user()->id]) }}">
      <i class="fas fa-edit" style="margin-right: 0.25em;"></i>
        {{ __('Edit') }}: {{ Auth::user()->name }}
      </a>
      <a class="dropdown-item" href="{{ route('preferences.login') }}">
        <i class="fas fa-wrench" style="margin-right: 0.25em;"></i>
        {{ __('Configure') }}: {{  __('Login method') }}
      </a>
      <a class="dropdown-item" href="{{ route('security_policy') }}">
        <i class="fas fa-shield-alt" style="margin-right: 0.25em;"></i>
        {{ __('Security policy') }}
      </a>
    @can('groups.create')
      <a class="dropdown-item" href="{{ route('group.create.form') }}">
        <i class="far fa-plus-square" style="margin-right: 0.25em;"></i>
        {{ __('Create') }}: {{ __('Group') }}
      </a>
    @endcan
    @can('users.create')
      <a class="dropdown-item" href="{{ route('user.create.form') }}">
        <i class="far fa-plus-square" style="margin-right: 0.25em;"></i>
        {{ __('Create') }}: {{ __('User') }}
      </a>
    @endcan
    @can('groups.list')
      <a class="dropdown-item" href="{{ route('groups') }}">
        <i class="fas fa-list-ul" style="margin-right: 0.25em;"></i>
        {{ __('Group list') }}
      </a>
    @endcan
    @can('users.list')
      <a class="dropdown-item" href="{{ route('users') }}">
        <i class="fas fa-list-ul" style="margin-right: 0.25em;"></i>
        {{ __('User list') }}
      </a>
    @endcan
    @can('system.administrate')
      <a class="dropdown-item" href="{{ route('sysadmin') }}">
        <i class="fas fa-cog" style="margin-right: 0.25em;"></i>
        {{ __('System administration') }}
      </a>
    @endcan
    </div>
  </div>
@endguest
