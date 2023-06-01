build:
	docker-compose up --build

down:
	docker-compose down

ps:
	docker-compose ps -a

db:
	docker-compose exec db psql -U <database_username> -W -d <database_name>

# WARNING: deletes all content in DB
prune:
	docker system prune -af --volumes

re: down
	make
