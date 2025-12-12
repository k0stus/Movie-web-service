#!/bin/bash

echo "Starting Go backend..."
(
  cd backend
  go run cmd/api/main.go
) &

echo "Starting Vite frontend..."
(
  cd frontend
  npm run dev
) &

wait

