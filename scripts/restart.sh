#!/bin/bash

docker compose down app baker joystick switcher whisper panel pocketbase
docker compose up -d
