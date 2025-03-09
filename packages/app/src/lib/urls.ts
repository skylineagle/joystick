const PORTS = {
  joystick: 8000,
  stream: 8889,
  stream_api: 9997,
  pocketbase: 8090,
  panel: 4000,
  baker: 3000,
  switcher: 8080,
} as const;

function getServiceUrl(service: keyof typeof PORTS): string {
  const hostname = window.location.hostname;
  const port = PORTS[service];

  return `http://${hostname}:${port}`;
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
  get stream_api() {
    return getServiceUrl("stream_api");
  },
  get baker() {
    return getServiceUrl("baker");
  },
  get switcher() {
    return getServiceUrl("switcher");
  },
  get pocketbase() {
    return getServiceUrl("pocketbase");
  },
};
