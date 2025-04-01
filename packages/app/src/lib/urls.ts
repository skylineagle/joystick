const PORTS = {
  joystick: 8000,
  stream: 8888,
  stream_api: 9997,
  pocketbase: 8090,
  panel: 4000,
  baker: 3000,
  studio: 8001,
  switcher: 8080,
  whisper: 8081,
} as const;

const PREFIXES = {
  joystick: "joystick",
  panel: "panel",
  baker: "baker",
  studio: "studio",
  switcher: "switcher",
  whisper: "whisper",
} as const;

function getServiceUrl(service: keyof typeof PORTS): string {
  const hostname = window.location.hostname;

  return `http://${hostname}${
    Object.keys(PREFIXES).includes(service) && import.meta.env.PROD
      ? `/${PREFIXES[service as keyof typeof PREFIXES]}`
      : `:${PORTS[service]}`
  }`;
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
  get whisper() {
    return getServiceUrl("whisper");
  },
  get switcher() {
    return getServiceUrl("switcher");
  },
  get pocketbase() {
    return getServiceUrl("pocketbase");
  },
  get studio() {
    return getServiceUrl("studio");
  },
};
