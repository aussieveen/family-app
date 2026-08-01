#!/bin/sh
set -e

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
  set -- php-fpm "$@"
fi

if [ "$1" = 'php-fpm' ] || [ "$1" = 'php' ] || [ "$1" = 'bin/console' ]; then
    composer install --prefer-dist --no-progress --no-suggest -o --no-interaction --ignore-platform-reqs --no-scripts

#    ./bin/console assets:install
    echo "Waiting for db to be ready..."
      until ./bin/console doctrine:database:create --if-not-exists > /dev/null 2>&1; do
        sleep 1
      done
        ./bin/console doctrine:migrations:migrate --no-interaction || echo "Warning: failed to run schema migration"
fi

# Define the directory path
service nginx start

chmod -R 777 var

exec docker-php-entrypoint "$@"
