export type NotifyVariant = "default" | "destructive" | "success";

type NotifyHandler = (title: string, description: string, variant: NotifyVariant) => void;

let handler: NotifyHandler | null = null;

export function setNotifyHandler(fn: NotifyHandler | null): void {
  handler = fn;
}

/**
 * Toast from outside React (zustand stores). No-op until StoreBootstrap
 * registers the real handler inside the ToastProvider.
 */
export function notify(
  title: string,
  description: string,
  variant: NotifyVariant = "default",
): void {
  handler?.(title, description, variant);
}
