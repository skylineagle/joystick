const PORTS = {
  joystick: 8000,
  stream: 8888,
  pocketbase: 8090,
  panel: 8080,
} as const;

function getServiceUrl(service: keyof typeof PORTS): string {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = PORTS[service];

  return `${protocol}//${hostname}:${port}`;
}

export const urls = {
  get joystick() {
    return getServiceUrl("joystick");
  },
  get panel() {
    return getServiceUrl("panel");
  },
  get stream() {
    return getServiceUrl("stream");
  },
  get pocketbase() {
    return getServiceUrl("pocketbase");
  },
};
