build:
	docker-compose up --build

down:
	docker-compose down

ps:
	docker-compose ps -a

db:
	docker-compose exec db psql -U myuser -W -d mydatabase

# truncate table users restart identity cascade;
# truncate table stats restart identity;

npm:
	cd backend; npm install; cd ..
	cd frontend; npm install; cd ..

prisma:
	cd backend/prisma; npx prisma migrate dev --name init; cd ../..
