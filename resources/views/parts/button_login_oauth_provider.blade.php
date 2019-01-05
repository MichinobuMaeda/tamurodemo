@inject('vh', 'App\Services\ViewHelperService')
<p>
  @if (isset($delete) && $delete)
  <button type="button" class="btn btn-secondary btn-block text-left" data-toggle="modal" data-target="#deleteConfirmation-{{ $provider }}">
    <span style="font-size: 1.2em; margin: 0 1em 0 0;">
      <i class="fas fa-times"></i>
    </span>
  @else
  <a href="{{ $route_reg }}" class="btn btn-outline-dark btn-block text-left">
  @endif
    {{ $slot }}
    {{ $vh->getProviderName($provider) }}
  @if (isset($delete) && $delete)
  </button>
  @else
  </a>
  @endif
</p>
@if (isset($delete) && $delete)
  @component('parts.modal_confirm_delete', ['id' => $provider, 'target' => $vh->getProviderName($provider)])
    {{ route('preferences.login.oauth', ['provider' => $provider]) }}
  @endcomponent
@endif
