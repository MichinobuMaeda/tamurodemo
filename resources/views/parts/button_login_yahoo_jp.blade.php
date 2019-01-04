<p>
  @if (isset($delete))
  <a href="{{ $slot }}" class="btn btn-secondary btn-block text-left">
    <span style="font-size: 1.2em; margin: 0 1em 0 0;">
      <i class="fas fa-times"></i>
    </span>
  @else
  <a href="{{ $slot }}" class="btn btn-outline-dark btn-block text-left">
  @endif
    <span style="font-size: 1.2em; margin: 0 0.75em 0 0; font-family: Copperplate, 'Wide Latin', serif; font-style: italic;">
      Y!
    </span>
    {{ __('Yahoo! JAPAN') }}
  </a>
</p>
