<div class="modal fade" id="deleteConfirmation-{{ $id }}" tabindex="-1" role="dialog" aria-labelledby="deleteConfirmation-{{ $id }}Label" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title text-danger" id="deleteConfirmation-{{ $id }}Label">
          <i class="fas fa-exclamation-triangle"></i>
          {{ __('Alert') }}
        </h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body alert-danger">
        <h4>{{ $target }}</h4>
        <p>{{ __('Do you really want to delete this?') }}</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" onclick="event.preventDefault();
                    document.getElementById('delete-form-{{ $id }}').submit();">
          {{ __('Delete') }}
        </button>
        <button type="button" class="btn btn-outline-secondary" data-dismiss="modal">
          {{ __('Cancel') }}
        </button>
      </div>
    </div>
  </div>
</div>
<form id="delete-form-{{ $id }}" action="{{ $slot }}" method="POST" style="display: none;">
  @method('DELETE')
  @csrf
</form>
