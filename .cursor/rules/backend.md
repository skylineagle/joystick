# Backend Rules

## Stack

The backend is built out of MediaMTX as the media server, Pocketbase as the DB, and several elysiajs microservices servers.

Here is an explanation about the services:

- joystick: the main services, responsible of the actual controling of the devices, this is where actions will be initiated from.
- baker: responsible of the Automation of devices, chaning there modes based on time spans or clock based markers.
- panel: a services that allows to ssh into devices and manage their sessions.
- switcher: will handle the mediamtx active sources using its API.
- whisper: allow communicating with devices using sms.
- studio: will manage fetching events from devices.

## Conventions

make sure to use the same patterns between all elysiajs servers in terms of structure, EP names and responses.
