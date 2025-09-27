up:
	@docker compose -f docker-compose.yml up --pull always -d

stop:
	@docker compose stop

restart:
	@docker compose restart

purge:
	@docker compose down --rmi all

logs:
	@docker compose logs -f

clear-cache:
	@docker exec bot rm -rf .cache/
	@docker compose restart
