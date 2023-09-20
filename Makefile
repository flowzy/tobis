dev:
	@docker compose up -d

prod:
	@docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

stop:
	@docker compose stop

clear-cache:
	@docker exec bot rm -rf .cache/
