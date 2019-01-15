<div class="row">
  <div class="col-md-12">
    @foreach($list as $item)
    <div class="form-check row" style="margin: 0.5em 0.25em;">
      <input class="form-check-input" type="checkbox" value="1"
        name="i{{ $item->id }}" id="i{{ $item->id }}"{{ in_array($item->id, $selected) ? ' checked' : '' }}>
      <label class="form-check-label btn btn-light btn-sm btn-block text-left" for="i{{ $item->id }}">
        {{ $item->name }}
      </label>
    </div>
    @endforeach
  </div>
</div>
