# Whisper SMS Server

A Bun server that exposes an API to send SMS messages and receive responses via webhooks using the Android SMS Gateway.

## Features

- Send SMS messages via a simple API endpoint
- Receive SMS responses via webhook
- Synchronous API that waits for SMS responses

## Installation

```bash
cd packages/whisper
bun install
```

## Usage

### Start the server

```bash
bun run index.ts
```

The server will start on port 3000.

### Send an SMS

Send a POST request to `/api/send-sms` with the following JSON body:

```json
{
  "phoneNumbers": ["+1234567890"],
  "message": "Hello, this is a test message"
}
```

The API will wait for the SMS response and return it when received.

### Webhook Configuration

Configure your Android SMS Gateway to send webhook events to:

```
http://your-server-url/webhook/sms
```

## API Reference

### POST /api/send-sms

Send an SMS message and wait for the response.

**Request Body:**

```json
{
  "phoneNumbers": string[],
  "message": string
}
```

**Response:**

```json
{
  "id": string,
  "status": string,
  "message": string,
  "timestamp": number
}
```

### POST /webhook/sms

Webhook endpoint for receiving SMS events from Android SMS Gateway.

### GET /health

Health check endpoint.

## Environment Variables

None required as credentials are hardcoded in the code. For production, consider moving these to environment variables.
