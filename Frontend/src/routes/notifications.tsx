import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { useNotifications } from "@/lib/query-hooks";
import { NotificationsView } from "@/components/views/notifications-view";

function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const notifications = (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    desc: n.message,
    read: n.is_read,
    time: n.created_at,
  }));

  return (
    <NotificationsView
      loading={isLoading}
      notifications={notifications}
      onClose={() => window.history.back()}
    />
  );
}

const notificationsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/notifications",
  component: NotificationsPage,
});

export const Route = notificationsRoute;
