#!/bin/bash

docker-compose run --rm ansible aws ecr get-login --no-include-email

# docker-compose run --rm ansible aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 522565598967.dkr.ecr.ap-southeast-1.amazonaws.com
