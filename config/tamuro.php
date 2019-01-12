<?php

return [

    'default_timezone' => env('APP_DEFAULT_TIMEZONE', 'UTC'),

    'date_format' => env('APP_DATE_FORMAT', 'Y-m-d'),
    'time_format' => env('APP_TIME_FORMAT', 'H:i:s'),
    'date_time_format' => env('APP_DATE_TIME_FORMAT', 'Y-m-d H:i:s'),
    'timestamp_format' => env('APP_TIMESTAMP_FORMAT', 'Y-m-d H:i:s'),

    'primary_user_email' => env('APP_PRIMARY_USER_EMAIL'),
    'primary_user_password' => env('APP_PASSWORD_RESET_EXPIRE'),

    'password_reset_expire' => env('APP_PASSWORD_RESET_EXPIRE', 60),
    'invitation_expire' => env('APP_INVITATION_EXPIRE', 600),

    'from_address' => env('MAIL_FROM_ADDRESS'),
    'from_name' => env('MAIL_FROM_NAME'),

    'oauth_google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
    ],
    'oauth_facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
        'app_secret' => env('FACEBOOK_APP_SECRET'),
    ],
    'oauth_yahoo_jp' => [
        'client_id' => env('YAHOO_JP_CLIENT_ID'),
        'secret' => env('YAHOO_JP_SECRET'),
        'redirect_uri1' => env('YAHOO_JP_REDIRECT_URI1'),
        'redirect_uri2' => env('YAHOO_JP_REDIRECT_URI2'),
    ],
    'oauth_amazon' => [
        'client_id' => env('AMAZON_CLIENT_ID'),
        'secret' => env('AMAZON_SECRET'),
        'redirect_uri1' => env('AMAZON_REDIRECT_URI1'),
        'redirect_uri2' => env('AMAZON_REDIRECT_URI2'),
    ],
];
