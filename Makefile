include .env

dev:
	@docker compose up --pull always -d

prod:
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml up --pull always -d

stop:
	@docker compose stop

restart:
	@docker compose restart

purge:
	@docker compose down --rmi all

logs:
	@docker compose logs -f

clear-cache:
	@docker exec ${DOCKER_PREFIX}bot rm -rf .cache/
	@docker compose restart
