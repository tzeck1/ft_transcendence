build:
	docker-compose up --build

#	FOR PRODUCTION:
#	set in 'docker-compose up --build' the -d flag and uncomment the command below
#	docker exec -dw /app/prisma backend npx prisma migrate dev --name init
#	Also add 'RUN npm run build' to backend/Dockerfile
#	and change in backend/Dockerfile and docker-compose.yml 'npm run start:dev' to 'npm run start:prod'
#	Also change in backend/.env	on DATABASE_URL 'localhost' to '${HOST_IP}'
#	Also add to backend/Dockerfile 'COPY tsconfig*.json ./'

down:
	docker-compose down

ps:
	docker-compose ps -a

db:
	docker-compose exec db psql -U myuser -W -d mydatabase

# truncate table users restart identity cascade; truncate table stats restart identity;

npm:
	cd backend; npm install; cd ..
	cd frontend; npm install; cd ..

prisma:
	cd backend/prisma; npx prisma migrate dev --name init; cd ../..
