import { createRootRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/app-header";
import { BottomNav } from "@/components/bottom-nav";
import { AiAssistant } from "@/components/ai-assistant";
import { Preloader } from "@/components/preloader";
import { ReportsDrawer } from "@/components/modals/reports-drawer";
import { Modals } from "@/components/modals";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";
import { useAiStore, useAiChips } from "@/store/ai-store";
import { useUiStore } from "@/store/ui-store";
import { useWeeklyReport, useNotifications } from "@/lib/query-hooks";
import { useToast } from "@/components/ui/toast";
import { playChime } from "@/lib/sound";

function RootLayout() {
  const authenticated = useAuthStore((s) => s.authenticated);
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const aiLang = useAiStore((s) => s.aiLang);
  const setAiLang = useAiStore((s) => s.setAiLang);
  const aiLoading = useAiStore((s) => s.aiLoading);
  const chatLogs = useAiStore((s) => s.chatLogs);
  const chatAudioUrls = useAiStore((s) => s.chatAudioUrls);
  const aiChips = useAiChips();
  const submitAiQuery = useAiStore((s) => s.submitAiQuery);
  const submitAiVoice = useAiStore((s) => s.submitAiVoice);
  const receiveIncomingTransfer = useUiStore((s) => s.receiveIncomingTransfer);
  const inventoryLoading = useSessionStore((s) => s.loading.inventory);
  const dashboardLoading = useSessionStore((s) => s.loading.dashboard);
  const debtorsLoading = useSessionStore((s) => s.loading.debtors);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const isLanding = location.pathname === "/";
  const isSandbox = location.pathname === "/sandbox";
  const isAuth = location.pathname === "/auth" || location.pathname === "/auth/register";
  // App chrome (sidebar, header, bottom nav) must never render on the
  // marketing/landing or auth routes, even when signed in.
  const showAppChrome = authenticated && !isLanding && !isAuth;

  // Weekly/activity polling only while the app shell is actually visible.
  const { data: weeklyData } = useWeeklyReport(showAppChrome);
  const { data: notificationData } = useNotifications(showAppChrome);
  const activityCount = notificationData?.filter((n) => !n.is_read).length ?? 0;

  // Non-static (data-fetching) app routes get the shimmering logo preloader
  // while the bootstrap queries make their first round.
  const bootstrapPending =
    showAppChrome && (inventoryLoading || dashboardLoading || debtorsLoading);

  // Redirect to auth when the backend rejects the session token (or the
  // user signs out via logout(), which dispatches the same event).
  useEffect(() => {
    const onUnauthorized = () => {
      setAuthenticated(false);
      if (location.pathname !== "/") {
        navigate({ to: "/auth", replace: true });
      }
    };
    window.addEventListener("traka:unauthorized", onUnauthorized);
    return () => window.removeEventListener("traka:unauthorized", onUnauthorized);
    // location.pathname must be a dependency: without it the guard reads a
    // stale path and bounces users off the landing page to /auth.
  }, [navigate, setAuthenticated, location.pathname]);

  // Listen for demo "incoming transfer" broadcasts sent from the secret
  // /sandbox simulator so the merchant dashboard can react in real time.
  useEffect(() => {
    if (isSandbox) return;
    const channel = new BroadcastChannel("traka_demo_channel");
    channel.onmessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.type !== "INCOMING_TRANSFER") return;
      const amount = Number(data.amount);
      const sender = String(data.sender ?? "Unknown Sender");
      const bank = String(data.bank ?? "Unknown Bank");
      playChime();
      toast({
        title: "Transfer Alert",
        description: `₦${amount.toLocaleString()} received from ${sender}!`,
        variant: "default",
      });
      receiveIncomingTransfer({ amount, sender, bank });
    };
    return () => channel.close();
  }, [isSandbox, toast, receiveIncomingTransfer]);

  if (isSandbox) {
    return (
      <main className="min-h-screen w-full bg-slate-100 text-slate-900">
        <Outlet />
      </main>
    );
  }

  // Landing & auth: plain full-width canvas, no chrome.
  if (!showAppChrome) {
    return (
      <div className="relative mx-auto flex min-h-dvh w-full flex-col overflow-clip">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  // App shell: persistent sidebar (desktop) / drawer (mobile), sticky
  // header, scrollable content column, floating bottom nav (mobile).
  return (
    <div className="relative flex min-h-dvh w-full bg-background">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenReports={() => setReportsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          activityCount={activityCount}
          onOpenMenu={() => setSidebarOpen(true)}
          onOpenChat={() => setAiOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-14 lg:pt-7">
          <Outlet />
        </main>
      </div>

      <Preloader visible={bootstrapPending} />

      <ReportsDrawer
        open={reportsOpen}
        onClose={() => setReportsOpen(false)}
        weeklyData={weeklyData ?? null}
      />

      <Modals />

      <AiAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        aiLang={aiLang}
        onSetAiLang={setAiLang}
        aiLoading={aiLoading}
        chips={aiChips}
        chatLogs={chatLogs}
        chatAudioUrls={chatAudioUrls}
        onSubmitQuery={submitAiQuery}
        onSubmitVoice={submitAiVoice}
      />

      {/* Mobile AI entry — floating action button above the tab bar. */}
      {!aiOpen && (
        <Button
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label="Open Traka AI"
          className="fixed bottom-20 right-5 z-30 h-14 w-14 rounded-full p-0 shadow-soft-lift hover:scale-105 active:scale-95 lg:hidden"
        >
          <Sparkle weight="fill" className="h-6 w-6" />
        </Button>
      )}

      <BottomNav />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
