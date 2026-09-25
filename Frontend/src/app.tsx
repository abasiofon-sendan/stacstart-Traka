import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@/routeTree";
import { StoreBootstrap } from "@/store/bootstrap";
import { ToastProvider } from "@/components/ui/toast";

/**
 * AppProvider lives above the router, so it can't call useLocation.
 * Track SPA navigation via the router's history and pass the pathname down —
 * AppProvider uses it to keep app-data fetches off the landing/auth routes.
 */
export function App() {
  const [pathname, setPathname] = useState(
    () => router.history.location.pathname,
  );
  useEffect(
    () =>
      router.history.subscribe(() =>
        setPathname(router.history.location.pathname),
      ),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <StoreBootstrap pathname={pathname}>
          <RouterProvider router={router} />
        </StoreBootstrap>
      </ToastProvider>
    </QueryClientProvider>
  );
}
