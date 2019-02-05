      <div class="card">
        <div class="card-header">
          @include('layouts.logo')
          {{ __('Security notification') }}
        </div>
        <div class="card-body">
        @component('parts.multi_line_message')
          Security notifications about EU ePrivacy directive and privacy policy ...
        @endcomponent
        <p>
          <a href="{{ route('security_policy') }}">
            <i class="far fa-file-alt"></i>
            {{ __('Security policy') }}
          </a>
        </p>
        </div>
      </div>
