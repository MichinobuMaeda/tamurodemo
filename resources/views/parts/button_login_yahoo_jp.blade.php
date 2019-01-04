@component('parts.button_login_oauth_provider', ['provider' => 'yahoo_jp', 'route_reg' => $route_reg, 'delete' => isset($delete) ? $delete : false])
    <span style="font-size: 1.2em; margin: 0 0.75em 0 0; font-family: Copperplate, 'Wide Latin', serif; font-style: italic;">
      Y!
    </span>
    {{ __('Yahoo! JAPAN') }}
    {{ __('Facebook') }}
@endcomponent
