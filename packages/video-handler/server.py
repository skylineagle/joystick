#!/usr/bin/env python3
import gi
import os
import logging
import threading
from flask import Flask, jsonify, request
import time
from flask_cors import CORS
gi.require_version('Gst', '1.0')
gi.require_version('GstRtp', '1.0')
from gi.repository import Gst, GstRtp, GLib

# --- Configuration ---
# Replace with the IP your camera sends RTCP feedback to:
CAMERA_IP = os.environ.get('CAMERA_IP', 'localhost')
RTP_PORT = int(os.environ.get('RTP_PORT', 5000))
RTCP_IN = int(os.environ.get('RTCP_IN', 5001))
RTCP_OUT = int(os.environ.get('RTCP_OUT', 5005))

BITRATE_MIN = int(os.environ.get('BITRATE_MIN', 500_000))
BITRATE_MAX = int(os.environ.get('BITRATE_MAX', 4_000_000))
BITRATE_STEP = int(os.environ.get('BITRATE_STEP', 250_000))
FPS_MIN = int(os.environ.get('FPS_MIN', 10))
FPS_MAX = int(os.environ.get('FPS_MAX', 30))
FPS_STEP = int(os.environ.get('FPS_STEP', 5))
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(level=LOG_LEVEL, format='[%(levelname)s] %(message)s')

current_bitrate = BITRATE_MAX
current_fps = FPS_MAX
last_adapt_time = 0
ADAPT_COOLDOWN_US = 5_000_000

# Initialize GStreamer
Gst.init(None)

last_activity = None
quality = 'high'

# Map RTCP type codes to friendly names
RTCP_TYPE_MAP = {
    GstRtp.RTCPType.SR:   "Sender Report",
    GstRtp.RTCPType.RR:   "Receiver Report",
    GstRtp.RTCPType.SDES: "Source Description",
    GstRtp.RTCPType.BYE:  "Goodbye",
    GstRtp.RTCPType.APP:  "Application"
}

app = Flask(__name__)
CORS(app)
start_time = time.time()
version = os.environ.get("VERSION", "unknown")

motioncells_element = None
motioncells_lock = threading.Lock()
motioncells_enabled = True
motioncells_display_prev = True

@app.route("/api/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "video-handler",
        "uptime": time.time() - start_time,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "version": version,
    })

def run_flask():
    app.run(host="0.0.0.0", port=int(os.environ.get("API_PORT", 7070)), debug=False, use_reloader=False)

flask_thread = threading.Thread(target=run_flask, daemon=True)
flask_thread.start()

def validate_env():
    if not (0 < RTP_PORT < 65536):
        raise ValueError('RTP_PORT must be 1-65535')
    if not (0 < RTCP_IN < 65536):
        raise ValueError('RTCP_IN must be 1-65535')
    if not (0 < RTCP_OUT < 65536):
        raise ValueError('RTCP_OUT must be 1-65535')
    if not (BITRATE_MIN > 0 and BITRATE_MAX >= BITRATE_MIN):
        raise ValueError('Invalid BITRATE_MIN/BITRATE_MAX')
    if not (FPS_MIN > 0 and FPS_MAX >= FPS_MIN):
        raise ValueError('Invalid FPS_MIN/FPS_MAX')
    if not CAMERA_IP:
        raise ValueError('CAMERA_IP is required')
validate_env()

def on_rtcp(pad, info):
    """Probe handler: parse RTCP packets and log SR/RR details."""
    global last_activity, quality, current_bitrate, current_fps, last_adapt_time

    buf = info.get_buffer()
    if not buf:
        return Gst.PadProbeReturn.OK

    success, map_info = buf.map(Gst.MapFlags.READ)
    if not success:
        return Gst.PadProbeReturn.OK

    rtcp_buf = GstRtp.RTCPBuffer()
    if not GstRtp.RTCPBuffer.map(buf, Gst.MapFlags.READ, rtcp_buf):
        buf.unmap(map_info)
        return Gst.PadProbeReturn.OK

    last_activity = GLib.get_monotonic_time()

    try:
        pkt = GstRtp.RTCPPacket()
        if rtcp_buf.get_first_packet(pkt):
            while True:
                t = pkt.get_type()
                name = RTCP_TYPE_MAP.get(t, f"Unknown({t})")
                logging.info(f"[RTCP] {name} (type={t})")

                if t == GstRtp.RTCPType.RR:
                    rb_count = pkt.get_rb_count()
                    logging.info(f"  report-blocks: {rb_count}")
                    for i in range(rb_count):
                        rb = pkt.get_rb(i)
                        logging.info(f"   └ block#{i}: loss={rb.fractionlost / 256.0:.3f}, total_lost={rb.packetslost}, jitter={rb.jitter}")
                        now = GLib.get_monotonic_time()
                        if now - last_adapt_time > ADAPT_COOLDOWN_US:
                            bitrate_changed = False
                            fps_changed = False
                            if rb.fractionlost / 256.0 > 0.05:
                                if current_bitrate > BITRATE_MIN:
                                    current_bitrate = max(BITRATE_MIN, current_bitrate - BITRATE_STEP)
                                    logging.info(f"set bitrate to: {current_bitrate}")
                                    bitrate_changed = True
                                if current_fps > FPS_MIN:
                                    current_fps = max(FPS_MIN, current_fps - FPS_STEP)
                                    logging.info(f"set fps to: {current_fps}")
                                    fps_changed = True
                            elif rb.fractionlost / 256.0 < 0.01:
                                if current_bitrate < BITRATE_MAX:
                                    current_bitrate = min(BITRATE_MAX, current_bitrate + BITRATE_STEP)
                                    logging.info(f"set bitrate to: {current_bitrate}")
                                    bitrate_changed = True
                                if current_fps < FPS_MAX:
                                    current_fps = min(FPS_MAX, current_fps + FPS_STEP)
                                    logging.info(f"set fps to: {current_fps}")
                                    fps_changed = True
                            if bitrate_changed or fps_changed:
                                last_adapt_time = now

                # Advance to next RTCP packet
                if not pkt.move_to_next():
                    break

    except Exception as e:
        logging.error(f"[RTCP] parse error: {e}")
    finally:
        rtcp_buf.unmap()
        buf.unmap(map_info)

    return Gst.PadProbeReturn.OK


@app.route("/api/motioncells", methods=["GET", "POST"])
def motioncells_api():
    global motioncells_element, motioncells_enabled, motioncells_display_prev
    if not motioncells_element:
        return jsonify({"error": "motioncells element not found"}), 500
    if request.method == "POST":
        data = request.get_json(force=True)
        updated = {}
        with motioncells_lock:
            if "enabled" in data:
                enabled = bool(data["enabled"])
                if enabled != motioncells_enabled:
                    pipeline.set_state(Gst.State.PAUSED)
                    first_videoconvert = None
                    second_videoconvert = None
                    it = pipeline.iterate_elements()
                    while True:
                        res, elem = it.next()
                        if res != Gst.IteratorResult.OK:
                            break
                        if elem.get_factory().get_name() == "videoconvert":
                            if not first_videoconvert:
                                first_videoconvert = elem
                            else:
                                second_videoconvert = elem
                                break
                    if not first_videoconvert or not second_videoconvert:
                        pipeline.set_state(Gst.State.PLAYING)
                        return jsonify({"error": "videoconvert elements not found"}), 500
                    if enabled:
                        # Restore: first_videoconvert -> motioncells -> second_videoconvert
                        srcpad = first_videoconvert.get_static_pad("src")
                        sinkpad = second_videoconvert.get_static_pad("sink")
                        if srcpad.is_linked():
                            srcpad.unlink(sinkpad)
                        srcpad2 = first_videoconvert.get_static_pad("src")
                        sinkpad2 = motioncells_element.get_static_pad("sink")
                        if not srcpad2.is_linked():
                            srcpad2.link(sinkpad2)
                        srcpad3 = motioncells_element.get_static_pad("src")
                        sinkpad3 = second_videoconvert.get_static_pad("sink")
                        if not srcpad3.is_linked():
                            srcpad3.link(sinkpad3)
                        motioncells_element.set_property("display", motioncells_display_prev)
                        motioncells_enabled = True
                    else:
                        # Bypass: first_videoconvert -> second_videoconvert
                        srcpad = first_videoconvert.get_static_pad("src")
                        sinkpad = motioncells_element.get_static_pad("sink")
                        if srcpad.is_linked():
                            srcpad.unlink(sinkpad)
                        srcpad2 = motioncells_element.get_static_pad("src")
                        sinkpad2 = second_videoconvert.get_static_pad("sink")
                        if srcpad2.is_linked():
                            srcpad2.unlink(sinkpad2)
                        srcpad3 = first_videoconvert.get_static_pad("src")
                        sinkpad3 = second_videoconvert.get_static_pad("sink")
                        if not srcpad3.is_linked():
                            srcpad3.link(sinkpad3)
                        motioncells_display_prev = motioncells_element.get_property("display")
                        motioncells_element.set_property("display", False)
                        motioncells_enabled = False
                    pipeline.set_state(Gst.State.PLAYING)
                    updated["enabled"] = enabled
            for key, value in data.items():
                if key == "enabled":
                    continue
                try:
                    motioncells_element.set_property(key, value)
                    updated[key] = value
                except Exception as e:
                    return jsonify({"error": f"Failed to set {key}: {e}"}), 400
        return jsonify({"updated": updated, "enabled": motioncells_enabled})
    # GET: return current properties
    props = ["threshold", "sensitivity", "display", "gap", "gridx", "gridy", "minimummotionframes", "motioncellthickness", "postallmotion", "postnomotion", "usealpha", "cellscolor"]
    result = {}
    with motioncells_lock:
        for prop in props:
            try:
                result[prop] = motioncells_element.get_property(prop)
            except Exception:
                result[prop] = None
        result["enabled"] = motioncells_enabled
    return jsonify(result)

logging.info(f"▶️  Server starting: RTP on UDP/{RTP_PORT}, RTCP in UDP/{RTCP_IN}, RTCP out to {CAMERA_IP}:{RTCP_OUT}")

# Build and launch the pipeline
try:
    pipeline = Gst.parse_launch(
        f'rtpbin name=rtpbin '
        f'udpsrc address=0.0.0.0 port={RTP_PORT} caps="application/x-rtp,media=video,clock-rate=90000,payload=96,encoding-name=H264" ! '
        'rtpbin.recv_rtp_sink_0 '
        'rtpbin. ! rtph264depay ! avdec_h264 ! videoconvert ! motioncells name=motioncells ! videoconvert !  x264enc tune=zerolatency speed-preset=superfast ! rtspclientsink location=rtsp://localhost:8554/stream latency=0 protocols=tcp '
        f'udpsrc address=0.0.0.0 port={RTCP_IN} caps="application/x-rtcp" ! rtpbin.recv_rtcp_sink_0 '
        f'rtpbin.send_rtcp_src_0 ! udpsink host={CAMERA_IP} port={RTCP_OUT} sync=false async=false'
    )
except Exception as e:
    logging.critical(f"Failed to create pipeline: {e}")
    exit(1)

motioncells_element = pipeline.get_by_name('motioncells')
if not motioncells_element:
    logging.critical("Failed to get motioncells element from pipeline")
    exit(1)

rtpbin = pipeline.get_by_name('rtpbin')

rtcp_pad = rtpbin.get_static_pad('recv_rtcp_sink_0')
if not rtcp_pad:
    logging.critical("Error: recv_rtcp_sink_0 pad not found on rtpbin")
    exit(1)
rtcp_pad.add_probe(Gst.PadProbeType.BUFFER, on_rtcp)

rtcp_pad = rtpbin.get_static_pad('send_rtcp_src_0')
if not rtcp_pad:
    logging.critical("Error: send_rtcp_src_0 pad not found on rtpbin")
    exit(1)
rtcp_pad.add_probe(Gst.PadProbeType.BUFFER, on_rtcp)

if pipeline.set_state(Gst.State.PLAYING) == Gst.StateChangeReturn.FAILURE:
    logging.critical("Failed to set pipeline to PLAYING state")
    exit(1)

# Run the main loop
try:
    GLib.MainLoop().run()
except KeyboardInterrupt:
    logging.info("⏹️  Stopping server…")
    pipeline.set_state(Gst.State.NULL)
