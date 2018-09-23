<?php

namespace App\Services;

use DateTime;
use DateTimeZone;
use Illuminate\Support\Facades\Auth;

class ViewHelperService
{
    /**
     * Create a new service instance.
     *
     * @return void
     */
    public function __construct()
    {
    }

    /**
     * Set the user's preferred time zone or APP_DEFAULT_TIMEZONE.
     * 
     * @param Datetime $val
     * @return Datetime
     */
    public function setTimezone($val) {
        $ret = clone $val;
        $user = Auth::user();
        $ret->setTimezone(new DateTimeZone(
            ($user && $user->timezone)
                ? $user->timezone
                : env('APP_DEFAULT_TIMEZONE', 'UTC')
        ));
        return $ret;
    }

    /**
     * Get date as format APP_DATE_FORMAT
     * with the user's preferred time zone or APP_DEFAULT_TIMEZONE.
     * 
     * @param Datetime $val
     * @return Datetime
     */
    public function formatDate($val) {
        $ret = $this->setTimezone($val);
        return $ret->format(env('APP_DATE_FORMAT', 'Y-m-d'));
    }

    /**
     * Get time as format APP_TIME_FORMAT
     * with the user's preferred time zone or APP_DEFAULT_TIMEZONE.
     * 
     * @param Datetime $val
     * @return Datetime
     */
    public function formatTime($val) {
        $ret = $this->setTimezone($val);
        return $ret->format(env('APP_TIME_FORMAT', 'H:i:s'));
    }

    /**
     * Get formated date and time as format APP_DATE_TIME_FORMAT
     * with the user's preferred time zone or APP_DEFAULT_TIMEZONE.
     * 
     * @param Datetime $val
     * @return Datetime
     */
    public function formatDateTime($val) {
        $ret = $this->setTimezone($val);
        return $ret->format(env('APP_DATE_TIME_FORMAT', 'Y-m-d H:i:s'));
    }

    /**
     * Get formated timestamp as format APP_TIMESTAMP_FORMAT
     * with the user's preferred time zone or APP_DEFAULT_TIMEZONE.
     * 
     * @param Datetime $val
     * @return Datetime
     */
    public function formatTimestamp($val) {
        $ret = $this->setTimezone($val);
        return $ret->format(env('APP_TIMESTAMP_FORMAT', 'Y-m-d H:i:s'));
    }
}
