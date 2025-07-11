const getPorts = (service: string) => {
  switch (service) {
    case "joystick":
      return 8000;
    case "stream":
      return 8889;
    case "stream_api":
      return 9997;
    case "pocketbase":
      return 8090;
    case "panel":
      return 4000;
    case "baker":
      return 3000;
    case "studio":
      return 8001;
    case "switcher":
      return 8080;
    case "whisper":
      return 8081;
    case "inngest":
      return 8288;
    default:
      break;
  }
};

const PREFIXES = {
  joystick: "joystick",
  panel: "panel",
  baker: "baker",
  studio: "studio",
  switcher: "switcher",
  whisper: "whisper",
  inngest: "inngest",
} as const;

function getServiceUrl(service: string): string {
  const hostname = window.location.hostname;

  return `http://${hostname}${
    Object.keys(PREFIXES).includes(service) && import.meta.env.PROD
      ? `/${PREFIXES[service as keyof typeof PREFIXES]}`
      : `:${getPorts(service)}`
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
  get inngest() {
    return getServiceUrl("inngest");
  },
};
