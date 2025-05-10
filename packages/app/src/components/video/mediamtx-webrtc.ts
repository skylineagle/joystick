// @ts-nocheck
const RESTART_RETRIES_AMOUNT = 3;
const RESTART_PAUSE_TIMEOUT_SEC = 2000;

const unquoteCredential = (v) => JSON.parse(`"${v}"`);

const linkToIceServers = (links) =>
  links !== null
    ? links.split(", ").map((link) => {
        const m = link.match(
          /^<(.+?)>; rel="ice-server"(; username="(.*?)"; credential="(.*?)"; credential-type="password")?/i
        );
        const ret: any = {
          urls: [m[1]],
        };

        if (m[3] !== undefined) {
          ret.username = unquoteCredential(m[3]);
          ret.credential = unquoteCredential(m[4]);
          ret.credentialType = "password";
        }

        return ret;
      })
    : [];

const parseOffer = (offer) => {
  const ret = {
    iceUfrag: "",
    icePwd: "",
    medias: [],
  };

  for (const line of offer.split("\r\n")) {
    if (line.startsWith("m=")) {
      ret.medias.push(line.slice("m=".length));
    } else if (ret.iceUfrag === "" && line.startsWith("a=ice-ufrag:")) {
      ret.iceUfrag = line.slice("a=ice-ufrag:".length);
    } else if (ret.icePwd === "" && line.startsWith("a=ice-pwd:")) {
      ret.icePwd = line.slice("a=ice-pwd:".length);
    }
  }

  return ret;
};

const enableStereoOpus = (section) => {
  let opusPayloadFormat = "";
  const lines = section.split("\r\n");

  for (let i = 0; i < lines.length; i++) {
    if (
      lines[i].startsWith("a=rtpmap:") &&
      lines[i].toLowerCase().includes("opus/")
    ) {
      opusPayloadFormat = lines[i].slice("a=rtpmap:".length).split(" ")[0];
      break;
    }
  }

  if (opusPayloadFormat === "") {
    return section;
  }

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("a=fmtp:" + opusPayloadFormat + " ")) {
      if (!lines[i].includes("stereo")) {
        lines[i] += ";stereo=1";
      }
      if (!lines[i].includes("sprop-stereo")) {
        lines[i] += ";sprop-stereo=1";
      }
    }
  }

  return lines.join("\r\n");
};

const editOffer = (offer) => {
  const sections = offer.sdp.split("m=");

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.startsWith("audio")) {
      sections[i] = enableStereoOpus(section);
    }
  }

  offer.sdp = sections.join("m=");
};

const generateSdpFragment = (offerData, candidates) => {
  const candidatesByMedia = {};
  for (const candidate of candidates) {
    const mid = candidate.sdpMLineIndex;
    if (candidatesByMedia[mid] === undefined) {
      candidatesByMedia[mid] = [];
    }
    candidatesByMedia[mid].push(candidate);
  }

  let frag =
    "a=ice-ufrag:" +
    offerData.iceUfrag +
    "\r\n" +
    "a=ice-pwd:" +
    offerData.icePwd +
    "\r\n";

  let mid = 0;

  for (const media of offerData.medias) {
    if (candidatesByMedia[mid] !== undefined) {
      frag += "m=" + media + "\r\n" + "a=mid:" + mid + "\r\n";

      for (const candidate of candidatesByMedia[mid]) {
        frag += "a=" + candidate.candidate + "\r\n";
      }
    }
    mid++;
  }

  return frag;
};

export class WHEPClient {
  private video;
  private videoUrl;
  private device;
  private window;
  private pc;
  private restartTimeout;
  private restartRetriesAmount;
  private sessionUrl;
  private queuedCandidates;
  private offerData;
  private isStopped;

  constructor(video, videoUrl, device, window) {
    this.video = video;
    this.videoUrl = videoUrl;
    this.device = device;
    this.window = window;
    this.pc = null;
    this.restartTimeout = null;
    this.restartRetriesAmount = 0;
    this.sessionUrl = "";
    this.queuedCandidates = [];
    this.isStopped = false;
    this.start();
  }

  start() {
    fetch(new URL(`${this.device}/whep`, this.videoUrl), {
      method: "OPTIONS",
    })
      .then((res) => this.onIceServers(res))
      .catch((err) => {
        this.scheduleRestart();
      });
  }

  stop() {
    this.isStopped = true;

    if (this.pc !== null) {
      this.pc.close();
      this.pc = null;
    }
  }

  onIceServers(res) {
    this.pc = new RTCPeerConnection({
      iceServers: linkToIceServers(res.headers.get("Link")),
    });

    const direction = "sendrecv";
    this.pc.addTransceiver("video", { direction });
    this.pc.addTransceiver("audio", { direction });

    this.pc.onicecandidate = (evt) => this.onLocalCandidate(evt);
    this.pc.oniceconnectionstatechange = () => this.onConnectionState();

    this.pc.ontrack = (evt) => {
      this.video.srcObject = evt.streams[0];
    };

    this.pc.createOffer().then((offer) => this.onLocalOffer(offer));
  }

  onLocalOffer(offer) {
    editOffer(offer);

    this.offerData = parseOffer(offer.sdp);
    this.pc.setLocalDescription(offer);

    fetch(new URL(`${this.device}/whep`, this.videoUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    })
      .then((res) => {
        if (res.status !== 201) {
          throw new Error("bad status code");
        }

        this.sessionUrl = new URL(
          `${res.headers.get("location")}`,
          this.videoUrl
        ).toString();
        return res.text();
      })
      .then((sdp) =>
        this.onRemoteAnswer(
          new RTCSessionDescription({
            type: "answer",
            sdp,
          })
        )
      )
      .catch((err) => {
        this.scheduleRestart();
      });
  }

  onConnectionState() {
    if (this.restartTimeout !== null) {
      return;
    }

    switch (this.pc.iceConnectionState) {
      case "disconnected":
        this.scheduleRestart();
    }
  }

  onRemoteAnswer(answer) {
    if (this.restartTimeout !== null) {
      return;
    }

    this.pc.setRemoteDescription(answer);

    if (this.queuedCandidates.length !== 0) {
      this.sendLocalCandidates(this.queuedCandidates);
      this.queuedCandidates = [];
    }
  }

  onLocalCandidate(evt) {
    if (this.restartTimeout !== null) {
      return;
    }

    if (evt.candidate !== null) {
      if (this.sessionUrl === "") {
        this.queuedCandidates.push(evt.candidate);
      } else {
        this.sendLocalCandidates([evt.candidate]);
      }
    }
  }

  sendLocalCandidates(candidates) {
    fetch(this.sessionUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/trickle-ice-sdpfrag",
        "If-Match": "*",
      },
      body: generateSdpFragment(this.offerData, candidates),
    })
      .then((res) => {
        if (res.status !== 204) {
          throw new Error("bad status code");
        }
      })
      .catch((err) => {
        this.scheduleRestart();
      });
  }

  scheduleRestart() {
    if (this.restartTimeout !== null || this.isStopped) {
      return;
    }

    if (this.pc !== null) {
      this.pc.close();
      this.pc = null;
    }

    if (this.restartRetriesAmount >= RESTART_RETRIES_AMOUNT) return;

    this.restartRetriesAmount++;

    this.restartTimeout = this.window.setTimeout(() => {
      this.restartTimeout = null;
      this.start();
    }, RESTART_PAUSE_TIMEOUT_SEC);

    if (this.sessionUrl) {
      fetch(this.sessionUrl, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.status !== 200) {
            throw new Error("bad status code");
          }
        })
        .catch((err) => {});
    }
    this.sessionUrl = "";

    this.queuedCandidates = [];
  }
}
