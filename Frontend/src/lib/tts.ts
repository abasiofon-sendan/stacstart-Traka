import type { AiLanguage } from "./endpoints";

const VOICE_MAP: Record<AiLanguage, string> = {
  en: "Emma",
  pidgin: "Emma",
  yo: "Tayo",
  ha: "Umar",
};

const YARNGPT_URL = "https://yarngpt.ai/api/v1/tts";
const API_KEY = import.meta.env.VITE_YARNGPT_KEY;
const MAX_CHARS = 2000;

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
  const voice = VOICE_MAP[language];
  const payload = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    const res = await fetch(YARNGPT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: payload, voice, response_format: "mp3" }),
    });
    if (!res.ok) return;

    const arrayBuffer = await res.arrayBuffer();
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
