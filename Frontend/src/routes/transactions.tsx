import { createRoute } from "@tanstack/react-router";
import { Route as RootRoute } from "@/routes/__root";
import { TransactionsView } from "@/components/views/transactions-view";
import { useTransactions } from "@/lib/query-hooks";

function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();

  return (
    <TransactionsView loading={isLoading} transactions={transactions ?? []} />
  );
}

const transactionsRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/transactions",
  component: TransactionsPage,
});

export const Route = transactionsRoute;
