#!/bin/bash

DATABASE_URL="postgresql://galib:galib2723@localhost:5432/brittoodb" npx prisma migrate dev --name $1
# docker compose -f docker-compose-dev.yml down
# docker compose -f docker-compose-dev.yml up -d

# docker compose -f docker-compose-dev.yml exec server sh
# # Inside container shell:
# npx prisma migrate dev --name init
# npx prisma generate
# exit