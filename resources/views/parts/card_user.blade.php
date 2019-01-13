<div class="card">
  <div class="card-header">
    @can('users.update', $user)
    <a href="{{ route('user.edit', ['user' => $user]) }}" class="text-primary float-right" style="background-color:transparent;">
      <i class="fas fa-edit"></i>
    </a>
    @endcan
    {{ $user->name }}
  </div>

  <div class="card-body">
    @include('parts.multi_line_text', ['text' => $user->desc])
    <p>
      @foreach($user->groups()->orderBy('name')->get() as $upper)
      <a href="{{ route('group', ['group' => $upper->id]) }}">
        <i class="fas fa-users" style="margin-right: 0 0.25em 0 0.5em"></i>
        {{ $upper->name }}
      </a>
      @endforeach
    </p>
    @if($user->groupsManaging()->count())
    <p>
      @foreach($user->groupsManaging()->orderBy('name')->get() as $lower)
        <a href="{{ route('group', ['group' => $lower->id]) }}">
          <i class="fas fa-user-tie" style="margin-right: 0 0.25em 0 0.5em"></i>
          {{ $lower->name }}
        </a>
        @endforeach
    </p>
    @endif
  </div>
</div>
