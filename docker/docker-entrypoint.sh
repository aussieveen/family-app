#!/bin/sh
set -e

if [ "${1#-}" != "$1" ]; then
  set -- php-fpm "$@"
fi

if [ "$1" = 'php-fpm' ] || [ "$1" = 'php' ] || [ "$1" = 'bin/console' ]; then
    composer install --prefer-dist --no-progress --no-suggest -o --no-interaction --ignore-platform-reqs
    chmod -R 777 var
    ./bin/console assets:install

    echo "Waiting for database..."
    until ./bin/console doctrine:query:sql "SELECT 1" --no-interaction > /dev/null 2>&1; do
        sleep 2
    done

    ./bin/console doctrine:migrations:migrate --no-interaction || echo "Warning: failed to run migrations"
fi

service nginx start

exec docker-php-entrypoint "$@"
