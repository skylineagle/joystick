#!/bin/bash

docker compose pull
docker compose down app baker joystick switcher whisper panel
docker compose up -d
