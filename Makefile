cnf ?= config.env
include $(cnf)
export $(shell sed 's/=.*//' $(cnf))

VERSION=$(shell ./version.sh)

.PHONY: help

help: ## This help.
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.DEFAULT_GOAL := help

build:	## build containers
	docker-compose build
	npm run build

up:		## gets all containers up
	docker-compose up -d --build
	npm run start

down:		## gets all containers up
	docker-compose down

run:	## run stuff
	docker-compose up -d --build

dev:	## starts without containerizing the server and use nodemon
	docker-compose up -d --build mongodb
	npx nodemon
