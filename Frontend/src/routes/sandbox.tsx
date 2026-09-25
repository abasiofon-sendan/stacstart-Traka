import { createRoute, useNavigate } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useState } from "react";
import { ArrowLeft, Lightning, Bank, Globe } from "@phosphor-icons/react";
import { primaryCta } from "@/lib/utils";

const PRESETS = [
  { label: "Baba Tunde", amount: 12500, bank: "GTBank" },
  { label: "Unknown Sender", amount: 16700, bank: "Access Bank" },
];

function SandboxPage() {
  const navigate = useNavigate();
  const [sender, setSender] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const dispatch = (payload: { amount: number; sender: string; bank: string }) => {
    const channel = new BroadcastChannel("traka_demo_channel");
    channel.postMessage({ type: "INCOMING_TRANSFER", ...payload });
    channel.close();
    setStatus(`Dispatched ₦${payload.amount.toLocaleString()} from ${payload.sender} (${payload.bank})`);
  };

  const sendPreset = (p: { label: string; amount: number; bank: string }) => {
    dispatch({ sender: p.label, amount: p.amount, bank: p.bank });
  };

  const sendCustom = () => {
    const amt = Number(amount);
    if (!sender.trim() || !amt || amt <= 0) return;
    dispatch({ sender: sender.trim(), amount: amt, bank: bank.trim() || "Unknown Bank" });
  };

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <button
        type="button"
        onClick={() => navigate({ to: "/", replace: true })}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" />
        Back to app
      </button>

      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
          <Lightning weight="fill" className="h-6 w-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Incoming Transfer Simulator
          </h1>
          <p className="text-sm text-slate-500">
            Demo tool — broadcasts a fake transfer to any open Traka dashboard tab.
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Bank weight="fill" className="h-4 w-4" />
          Quick Presets
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => sendPreset(p)}
              className={primaryCta + " flex-col items-start gap-1 px-4 py-3 text-left"}
            >
              <span className="text-sm font-bold">{p.label}</span>
              <span className="font-mono text-lg font-black">₦{p.amount.toLocaleString()}</span>
              <span className="text-[11px] font-medium text-white/80">{p.bank}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Globe weight="fill" className="h-4 w-4" />
          Custom Transfer
        </h2>
        <div className="space-y-3">
          <input
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="Sender name"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
          />
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            placeholder="Amount (₦)"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 font-mono text-sm outline-none focus:border-primary"
          />
          <input
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            placeholder="Bank (optional)"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={sendCustom}
            disabled={!sender.trim() || !Number(amount)}
            className={primaryCta + " w-full justify-center py-3 disabled:cursor-not-allowed disabled:opacity-50"}
          >
            Dispatch Transfer
          </button>
        </div>
      </section>

      {status && (
        <p className="mt-6 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white">
          {status}
        </p>
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: "/sandbox",
  component: SandboxPage,
});
