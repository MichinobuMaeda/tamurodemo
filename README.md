Tamuro
======

A group ware for closed communities.

Requirements

 - PHP: 7.2
 - Composer


Setup dev. environment

    $ git clone https://github.com/MichinobuMaeda/tamuro.git
    $ cd tamuro
    $ composer install
    $ touch storage/tamuro.sqlite 

Test

    $ composer test

Run with test data for local

    $ cp .env.local .env.dev
    $ vi .env.dev
    $ cp .env.dev .env
    $ php artisan migrate:refresh --seed
    $ php artisan serve --host localhost --port 8000
