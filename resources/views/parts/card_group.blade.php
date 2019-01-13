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
      <a href="{{ $upper->hasRole('primary') ? route('home') : route('group', ['group' => $upper->id]) }}">
        <i class="fas fa-angle-double-left" style="margin-right: 0.5em"></i>
        {{ $upper->name }}
      </a>
    </p>
    @endforeach
    @foreach($group->subGroups()->orderBy('name')->get() as $lower)
    <p>
      <a href="{{ route('group', ['group' => $lower->id]) }}">
        {{ $lower->name }}
        <i class="fas fa-angle-double-right" style="margin-right: 0.5em"></i>
      </a>
    </p>
    @endforeach
    @if($group->managers()->count())
    <p>
      {{ __('Managers:') }}
      @foreach($group->managers()->orderBy('name')->get() as $manager)
        <a href="{{ route('user', ['user' => $manager->id]) }}">
          <i class="fas fa-user-tie" style="margin: 0 0.25em 0 0.5em"></i>
          {{ $manager->name }}
        </a>
      @endforeach
    </p>
    @endif
    @foreach($group->members()->orderBy('name')->get() as $member)
    <p>
      <a href="{{ route('user', ['user' => $member->id]) }}">
        {{ $member->name }}
      </a>
    </p>
    @endforeach
  </div>
</div>
