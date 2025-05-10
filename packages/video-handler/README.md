# Video Handler Server

## Setup

Install dependencies:

bun install
pip install -r requirements.txt

## Environment Variables

- CAMERA_IP: IP address to send RTCP feedback to (default: localhost)
- RTP_PORT: UDP port for RTP (default: 5000)
- RTCP_IN: UDP port for incoming RTCP (default: 5001)
- RTCP_OUT: UDP port for outgoing RTCP (default: 5005)
- BITRATE_MIN: Minimum video bitrate (default: 500000)
- BITRATE_MAX: Maximum video bitrate (default: 4000000)
- BITRATE_STEP: Bitrate adjustment step (default: 250000)
- FPS_MIN: Minimum frames per second (default: 10)
- FPS_MAX: Maximum frames per second (default: 30)
- FPS_STEP: FPS adjustment step (default: 5)
- LOG_LEVEL: Logging level (default: INFO)
- HEALTH_PORT: Port for health check endpoint (default: 8080)
- VERSION: Service version (default: unknown)

## Running

bun run python3 server.py

## Docker

Build the image:

docker build -t video-handler .

Run the container:

docker run --rm -p 5000:5000 -p 5001:5001 -p 5005:5005 -p 8080:8080 \
 -e CAMERA_IP=localhost \
 -e RTP_PORT=5000 \
 -e RTCP_IN=5001 \
 -e RTCP_OUT=5005 \
 -e LOG_LEVEL=INFO \
 video-handler

Health check:

curl http://localhost:8080/api/health
