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
    @if($user->managingGroups()->count())
    <ul class="list-inline">
      @foreach($user->managingGroups()->orderBy('name')->get() as $group)
      <li class="list-inline-item"><a href="{{ route('group', ['group' => $group->id]) }}">
        <i class="fas fa-user-tie" style="margin: 0 0.25em 0 0.5em"></i>
        {{ $group->name }}
      </a></li>
      @endforeach
    </ul>
    @endif
    <ul class="list-inline">
      @foreach($user->groups()->orderBy('name')->get() as $group)
      <li class="list-inline-item"><a href="{{ route('group', ['group' => $group->id]) }}">
        <i class="fas fa-user-friends" style="margin: 0 0.25em 0 0.5em"></i>
        {{ $group->name }}
      </a></li>
      @endforeach
    </ul>
  </div>
</div>
