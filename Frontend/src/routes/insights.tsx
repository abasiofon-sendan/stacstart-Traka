import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { PageHeader } from "@/components/page-header";
import {
  WeeklyReportBody,
  WeeklyReportFooter,
  summarizeWeeklyReport,
} from "@/components/modals/reports-drawer";
import { useWeeklyReport } from "@/lib/query-hooks";
import { Skeleton } from "@/components/ui/skeleton";

function InsightsPage() {
  const { data, isLoading } = useWeeklyReport();
  const summary = summarizeWeeklyReport(data ?? null);

  return (
    <div>
      <PageHeader
        eyebrow="Insights — this week"
        title="Weekly Insights"
        description="Your business performance at a glance."
      />

      {isLoading && !data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 rounded-sm" />
            <Skeleton className="h-28 rounded-sm" />
          </div>
          <Skeleton className="h-48 rounded-sm" />
        </div>
      ) : (
        <div className="space-y-4">
          <WeeklyReportBody summary={summary} />
          <div className="rounded-sm border border-border bg-card p-4">
            <WeeklyReportFooter summary={summary} />
          </div>
        </div>
      )}
    </div>
  );
}

const insightsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/insights",
  component: InsightsPage,
});

export const Route = insightsRoute;
