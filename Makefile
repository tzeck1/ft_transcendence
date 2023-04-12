build:
	docker-compose up --build

down:
	docker-compose down

ps:
	docker-compose ps -a

db:
	docker-compose exec db psql -U myuser -W -d mydatabase
