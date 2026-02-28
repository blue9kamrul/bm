#!/bin/bash

echo -n "Enter Port To Forward: " 
read port

if ! [[ "$port" =~ ^[0-9]+$ ]]; then
  echo "❌ Error: Port must be a number."
  exit 1
fi

echo "✅ Starting ngrok on port $port..."
ngrok http --domain=evolving-champion-bullfrog.ngrok-free.app $port