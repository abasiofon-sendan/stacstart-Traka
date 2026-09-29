import type { AiLanguage } from "./endpoints";

// Documented base — the non-api host is not the TTS endpoint.
const YARN_BASE = "https://api.yarngpt.ai";
const API_KEY = import.meta.env.VITE_YARNGPT_KEY;
const MAX_CHARS = 2000;

/** Our language codes mapped onto YarnGPT's 18 translation/voice codes. */
const LANG_CODES: Record<AiLanguage, string> = {
  en: "en",
  // Pidgin has no catalogue code — an English voice reads it closest.
  pidgin: "en",
  yo: "yo",
  ha: "ha",
  sw: "sw",
};

interface VoiceEntry {
  id?: unknown;
  name?: unknown;
  voice?: unknown;
  voice_id?: unknown;
  default?: unknown;
  languages?: unknown;
  locales?: unknown;
}

let voicesCache: VoiceEntry[] | null = null;

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function voiceId(entry: VoiceEntry): string | undefined {
  return (
    asString(entry.id) ??
    asString(entry.voice_id) ??
    asString(entry.voice) ??
    asString(entry.name)
  );
}

function voiceLanguages(entry: VoiceEntry): string[] {
  const raw = entry.languages ?? entry.locales;
  if (!Array.isArray(raw)) return [];
  return raw.filter((l): l is string => typeof l === "string");
}

async function fetchVoices(): Promise<VoiceEntry[]> {
  if (voicesCache) return voicesCache;
  try {
    const res = await fetch(`${YARN_BASE}/api/v1/voices`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const list = Array.isArray(data)
      ? data
      : (data as { voices?: unknown }).voices;
    voicesCache = Array.isArray(list) ? (list as VoiceEntry[]) : [];
    return voicesCache;
  } catch {
    return [];
  }
}

/**
 * Resolve a voice id from the live catalogue instead of hardcoding one —
 * ids are exact, case-sensitive, and change over time. Returns undefined
 * when the catalogue is unreachable or lists nothing suitable, in which
 * case the request omits `voice` and the provider uses its own default.
 */
async function pickVoice(language: AiLanguage): Promise<string | undefined> {
  const code = LANG_CODES[language];
  const voices = await fetchVoices();
  const withIds = voices.filter((v) => voiceId(v) !== undefined);
  if (withIds.length === 0) return undefined;
  const listed = withIds.find((v) =>
    voiceLanguages(v).some((l) => l.toLowerCase() === code),
  );
  if (listed) return voiceId(listed);
  const fallback = withIds.find((v) => v.default === true) ?? withIds[0];
  return fallback ? voiceId(fallback) : undefined;
}

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export async function speakReply(text: string, language: AiLanguage): Promise<void> {
  if (!API_KEY) return;
  const payload = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    // Mint a streaming ticket (prepare reads no Idempotency-Key and needs no
    // polling loop) using the documented output_format field — mp3 default.
    const voice = await pickVoice(language);
    const body: Record<string, string> = { text: payload, output_format: "mp3" };
    if (voice) body.voice = voice;

    const prep = await fetch(`${YARN_BASE}/api/v1/tts/prepare`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!prep.ok) return;
    const ticket = (await prep.json()) as { stream_url?: unknown };
    const streamPath = asString(ticket.stream_url);
    if (!streamPath) return;
    const streamUrl = streamPath.startsWith("http")
      ? streamPath
      : `${YARN_BASE}${streamPath}`;

    // No auth header on this leg — the ticket in the path is the credential.
    // A refusal here looks like a failed load, so check before decoding.
    const audioRes = await fetch(streamUrl);
    if (!audioRes.ok) return;
    const arrayBuffer = await audioRes.arrayBuffer();
    if (arrayBuffer.byteLength === 0) return;

    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    cancelSpeech();
    source.start(0);
    currentSource = source;
  } catch {
    // silent skip
  }
}

export function cancelSpeech(): void {
  if (currentSource) {
    try { currentSource.stop(); } catch { /* already stopped */ }
    currentSource.disconnect();
    currentSource = null;
  }
}

export function ensureAudioReady(): void {
  const ctx = getCtx();
  if (ctx.state === "suspended") ctx.resume();
}
