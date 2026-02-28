#!/bin/bash

CLIENT_CONTAINER=britto-client-cnt
SERVER_CONTAINER=britto-server-cnt
COMPOSE_FILE=docker-compose-dev.yml

run_all() {
  echo "Starting all containers using Docker Compose..."
  docker compose -f $COMPOSE_FILE up -d
}

run_client() {
  if [ -n "$(docker ps -aq -f name=$CLIENT_CONTAINER)" ]; then
    echo "⚠️  Client container '$CLIENT_CONTAINER' already exists. Stop it first."
  else
    echo "Running client container..."
    docker run \
      -v "$(pwd)/client:/app" \
      -v britto-client-node-modules:/app/node_modules \
      -p 5173:5173 \
      -d --name $CLIENT_CONTAINER brittoo-client

    echo "📦 Installing client dependencies..."
    docker exec $CLIENT_CONTAINER npm install
  fi
}

run_server() {
  if [ -n "$(docker ps -aq -f name=$SERVER_CONTAINER)" ]; then
    echo "⚠️  Server container '$SERVER_CONTAINER' already exists. Stop it first."
  else
    echo "Running server container..."
    docker run \
      -v "$(pwd)/server:/app" \
      -v britto-server-node-modules:/app/node_modules \
      -p 5000:5000 \
      -d --name $SERVER_CONTAINER \
      brittoo-server

    echo "📦 Installing server dependencies..."
    docker exec $SERVER_CONTAINER npm install
  fi
}

stop_all() {
  echo "Stopping all services and removing volumes..."
  docker compose -f $COMPOSE_FILE down
}

stop_client() {
  echo "Stopping and removing client container..."
  docker rm -fv $CLIENT_CONTAINER
}

stop_server() {
  echo "Stopping and removing server container..."
  docker rm -fv $SERVER_CONTAINER
}

build_client() {
  echo "Building client image..."
  docker build -f ./client/Dockerfile.dev -t brittoo-client ./client
}

build_server() {
  echo "Building server image..."
  docker build -f ./server/Dockerfile.dev -t brittoo-server ./server
}

build_all() {
  echo "Building all services with Docker Compose..."
  docker compose -f $COMPOSE_FILE up -d --build
}

# Main command handling
case "$1" in
  run)
    case "$2" in
      all) run_all ;;
      client) run_client ;;
      server) run_server ;;
      *) echo "Usage: $0 run [all|client|server]" ;;
    esac
    ;;
  stop)
    case "$2" in
      all) stop_all ;;
      client) stop_client ;;
      server) stop_server ;;
      *) echo "Usage: $0 stop [all|client|server]" ;;
    esac
    ;;
  build)
    case "$2" in
      all) build_all ;;
      client) build_client ;;
      server) build_server ;;
      *) echo "Usage: $0 build [all|client|server]" ;;
    esac
    ;;
  *)
    echo "Usage: $0 [run|build|stop] [all|client|server]"
    ;;
esac
