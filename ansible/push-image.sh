#!/bin/bash

docker build --no-cache -t ai4food-service:latest -t ai4food-service:$1 ..

docker tag ai4food-service:latest 430558697501.dkr.ecr.ap-southeast-1.amazonaws.com/ai4food-service:latest

docker tag ai4food-service:$1 430558697501.dkr.ecr.ap-southeast-1.amazonaws.com/ai4food-service:$1

docker push 430558697501.dkr.ecr.ap-southeast-1.amazonaws.com/ai4food-service:latest

docker push 430558697501.dkr.ecr.ap-southeast-1.amazonaws.com/ai4food-service:$1

docker-compose run --rm ansible