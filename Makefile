include .env

dev:
	@docker compose up -d --build

prod:
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

stop:
	@docker compose stop

restart:
	@docker compose restart

clear-cache:
	@docker exec ${DOCKER_PREFIX}bot rm -rf .cache/
