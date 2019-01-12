<div class="card">
  <div class="card-header">
    @can('groups.update', $group)
    <a href="{{ route('group.edit', ['group' => $group]) }}" class="text-primary float-right" style="background-color:transparent;">
      <i class="fas fa-edit"></i>
    </a>
    @endcan
    {{ $group->name }}
  </div>

  <div class="card-body">
    @include('parts.multi_line_text', ['text' => $group->desc])
    @foreach($group->superGroups()->orderBy('name')->get() as $upper)
    <p>
      <a href="{{ route('group', ['group' => $upper->id]) }}">
        <i class="fas fa-arrow-alt-circle-up" style="margin-right: 0.5em"></i>
        {{ $upper->name }}
      </a>
    </p>
    @endforeach
    @foreach($group->subGroups()->orderBy('name')->get() as $lower)
    <p>
      <a href="{{ route('group', ['group' => $lower->id]) }}">
        <i class="far fa-arrow-alt-circle-down" style="margin-right: 0.5em"></i>
        {{ $lower->name }}
      </a>
    </p>
    @endforeach
    @foreach($group->managers()->orderBy('name')->get() as $manager)
    <p>
      <a href="{{ route('user', ['user' => $manager->id]) }}">
        <i class="fas fa-user-tie" style="margin-right: 0.5em"></i>
        {{ $manager->name }}
      </a>
    </p>
    @endforeach
    @foreach($group->members()->orderBy('name')->get() as $member)
    <p>
      <a href="{{ route('user', ['user' => $member->id]) }}">
        <i class="far fa-user" style="margin-right: 0.5em"></i>
        {{ $member->name }}
      </a>
    </p>
    @endforeach
  </div>
</div>
