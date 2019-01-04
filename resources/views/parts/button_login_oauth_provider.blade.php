<p>
  @if (isset($delete) && $delete)
  <button type="button" class="btn btn-secondary btn-block text-left" data-toggle="modal" data-target="#deleteConfirmation">
    <span style="font-size: 1.2em; margin: 0 1em 0 0;">
      <i class="fas fa-times"></i>
    </span>
  @else
  <a href="{{ $route_reg }}" class="btn btn-outline-dark btn-block text-left">
  @endif
    {{ $slot }}
  @if (isset($delete) && $delete)
  </button>
  @else
  </a>
  @endif
</p>
@if (isset($delete) && $delete)
  @component('parts.modal_confirm_delete')
    {{ route('preferences.login.oauth', ['provider' => $provider]) }}
  @endcomponent
@endif
