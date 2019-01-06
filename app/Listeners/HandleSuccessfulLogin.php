<?php

namespace App\Listeners;

use DateTime;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Log;

class HandleSuccessfulLogin
{
  /**
   * Create the event listener.
   *
   * @return void
   */
  public function __construct()
  {
      //
  }

  /**
   * Handle the event.
   *
   * @param  Login  $event
   * @return void
   */
  public function handle(Login $event)
  {
    if ($event->user->invitation_token || $event->user->invited_at) {
      $event->user->invitation_token = null;
      $event->user->invited_at = null;
      $event->user->entered_at = new DateTime();
      $event->user->save();
      $event->user->refresh();
    } else if (!$event->user->entered_at) {
      $event->user->entered_at = new DateTime();
      $event->user->save();
      $event->user->refresh();
    }
  }
}
