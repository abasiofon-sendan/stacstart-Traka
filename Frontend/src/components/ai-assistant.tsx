import { useState, useRef, useEffect } from "react";
import {
  MagicWand,
  PaperPlaneRight,
  X,
  Microphone,
  CircleNotch,
  SpeakerHigh,
  SpeakerSlash,
} from "@phosphor-icons/react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/use-media-query";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { AiLanguage } from "@/lib/endpoints";
import { speakReply, cancelSpeech, ensureAudioReady } from "@/lib/tts";

interface AiAssistantProps {
  open: boolean;
  onClose: () => void;
  aiLang: AiLanguage;
  onSetAiLang: (lang: AiLanguage) => void;
  aiLoading: boolean;
  chips: string[];
  chatLogs: string[];
  chatAudioUrls?: Record<number, string>;
  onSubmitQuery: (text: string) => void;
  onSubmitVoice: (audio: Blob) => void;
}

interface AssistantBodyProps {
  onClose: () => void;
  aiLang: AiLanguage;
  onSetAiLang: (lang: AiLanguage) => void;
  aiLoading: boolean;
  chips: string[];
  chatLogs: string[];
  chatAudioUrls?: Record<number, string>;
  onSubmitQuery: (text: string) => void;
  onSubmitVoice: (audio: Blob) => void;
}

const LANGUAGES: { code: AiLanguage; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "pidgin", label: "Pidgin" },
  { code: "yo", label: "Yoruba" },
  { code: "ha", label: "Hausa" },
];

export function AiAssistant({
  open,
  onClose,
  aiLang,
  onSetAiLang,
  aiLoading,
  chips,
  chatLogs,
  chatAudioUrls,
  onSubmitQuery,
  onSubmitVoice,
}: AiAssistantProps) {
  // Desktop gets a right-docked panel (radix Sheet), mobile keeps the
  // bottom-sheet drawer. The shared body lives below in AssistantBody.
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const body = (
    <AssistantBody
      onClose={onClose}
      aiLang={aiLang}
      onSetAiLang={onSetAiLang}
      aiLoading={aiLoading}
      chips={chips}
      chatLogs={chatLogs}
      chatAudioUrls={chatAudioUrls}
      onSubmitQuery={onSubmitQuery}
      onSubmitVoice={onSubmitVoice}
    />
  );

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="gap-0 p-0 sm:max-w-[440px]"
        >
          <SheetTitle className="sr-only">Traka Intelligent Assistant</SheetTitle>
          {body}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="h-[480px]">
        <DrawerTitle className="sr-only">Traka Intelligent Assistant</DrawerTitle>
        {body}
      </DrawerContent>
    </Drawer>
  );
}

function AssistantBody({
  onClose,
  aiLang,
  onSetAiLang,
  aiLoading,
  chips,
  chatLogs,
  chatAudioUrls,
  onSubmitQuery,
  onSubmitVoice,
}: AssistantBodyProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const prevLogsLen = useRef(0);
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({});

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLogs, aiLoading]);

  useEffect(() => {
    ensureAudioReady();
  }, []);

  useEffect(() => {
    return () => {
      mediaRef.current?.state !== "inactive" && mediaRef.current?.stop();
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (chatLogs.length <= prevLogsLen.current || muted) return;
    const last = chatLogs[chatLogs.length - 1];
    if (last?.startsWith("bot:")) {
      const text = last.slice(4);
      if (text && !text.includes("could not reach the advisor") && !text.includes("could not understand")) {
        speakReply(text, aiLang);
      }
    }
    prevLogsLen.current = chatLogs.length;
  }, [chatLogs, aiLang, muted]);

  const startRecording = async () => {
    ensureAudioReady();
    cancelSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0) onSubmitVoice(blob);
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      toast({
        title: "Microphone Blocked",
        description: "Allow microphone access to send a voice note.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  };

  const handleSubmit = () => {
    if (!input.trim() || aiLoading) return;
    ensureAudioReady();
    cancelSpeech();
    onSubmitQuery(input);
    setInput("");
  };

  const lastLog = chatLogs[chatLogs.length - 1];
  const lastIsUser = !!lastLog && lastLog.startsWith("user:");
  const showTyping = aiLoading && lastIsUser;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
      {/* ── Header row ── */}
      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <MagicWand weight="fill" className="h-5 w-5 text-primary" />
          <span className="text-base font-bold text-foreground">Traka Intelligent Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "Unmute replies" : "Mute replies"}
            className={muted ? "bg-secondary text-foreground" : "text-muted-foreground"}
          >
            {muted ? <SpeakerSlash weight="bold" className="h-4 w-4" /> : <SpeakerHigh weight="bold" className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close assistant"
            className="text-muted-foreground"
          >
            <X weight="bold" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Language pills ── */}
      <div className="mt-3 flex shrink-0 flex-wrap gap-1.5">
        {LANGUAGES.map((lang) => (
          <Button
            key={lang.code}
            type="button"
            size="xs"
            variant={aiLang === lang.code ? "default" : "outline"}
            onClick={() => onSetAiLang(lang.code)}
            className={aiLang === lang.code ? undefined : "text-muted-foreground"}
          >
            {lang.label}
          </Button>
        ))}
      </div>

      {/* ── Dynamic scroll area ── */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-1 py-4">
        <div className="space-y-3">
          {chatLogs.map((log, i) => {
            if (log.startsWith("user:")) {
              const text = log.slice(5);
              const isAudio = text === "🎤";
              const audioUrl = chatAudioUrls?.[i];
              return (
                <div key={i} className="flex justify-end">
                  {isAudio && audioUrl ? (
                    <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 shadow-sm">
                      <audio
                        ref={(el) => { if (el) audioRefs.current[i] = el; }}
                        src={audioUrl}
                        controls
                        className="h-8 max-w-[180px]"
                        style={{ filter: "invert(1) brightness(2)" }}
                      />
                    </div>
                  ) : (
                    <span className="inline-block max-w-[85%] rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm">
                      {text}
                    </span>
                  )}
                </div>
              );
            }
            const text = log.startsWith("bot:") ? log.slice(4) : log;
            return (
              <div key={i}>
                <div className="inline-block max-w-[85%] rounded-lg rounded-tl-none border border-border bg-secondary p-4 text-sm leading-relaxed text-foreground shadow-sm">
                  <MagicWand weight="fill" className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
                  {text}
                </div>
              </div>
            );
          })}

          {showTyping && (
            <div className="flex">
              <div className="flex max-w-[85%] items-center gap-2 rounded-lg rounded-tl-none border border-border bg-secondary p-4 text-foreground shadow-sm">
                <MagicWand weight="fill" className="h-3.5 w-3.5 text-primary" />
                <CircleNotch className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}

          {chatLogs.length === 0 && (
            <div className="mb-4 max-w-[85%] rounded-lg rounded-tl-none border border-border bg-secondary p-4 text-sm leading-relaxed text-foreground shadow-sm">
              <MagicWand weight="fill" className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
              {aiLang === "pidgin"
                ? "Ahn-ahn! I dey track your live data sharply. Drop your question like \"Who dey owe me?\" or \"Who clear debt last?\"."
                : "Hello! I scan your live business data instantly. Ask me something like \"Who is owing me?\" or \"Who paid last?\"."}
            </div>
          )}
        </div>
      </div>

      {/* ── Horizontal suggestion pills ── */}
      <div className="flex shrink-0 items-center gap-2 overflow-x-auto py-3 no-scrollbar">
        {chips.map((chip) => (
          <Button
            key={chip}
            type="button"
            size="xs"
            variant="outline"
            disabled={aiLoading}
            onClick={() => onSubmitQuery(chip)}
            className="h-auto shrink-0 whitespace-nowrap bg-card px-4 py-2 font-medium"
          >
            {chip}
          </Button>
        ))}
      </div>

      {/* ── Input action bar ── */}
      <div className="mt-auto flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={recording ? stopRecording : startRecording}
          aria-label={recording ? "Stop recording" : "Record voice note"}
          className={
            recording
              ? "animate-pulse bg-destructive text-destructive-foreground hover:bg-destructive hover:text-destructive-foreground"
              : "text-muted-foreground"
          }
        >
          <Microphone weight="fill" className="h-4 w-4" />
        </Button>
        <input
          type="text"
          value={input}
          disabled={aiLoading || recording}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={recording ? "Listening..." : "Ask anything about your business..."}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
        />
        <Button
          type="button"
          variant="tertiary"
          size="icon"
          onClick={handleSubmit}
          disabled={aiLoading || recording}
          aria-label="Send message"
        >
          <PaperPlaneRight weight="fill" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
