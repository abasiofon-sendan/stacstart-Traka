import type { ReactNode } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name (sr-only on desktop; bodies render their own header). */
  title: string;
  description?: string;
  /** Wider right-docked panel for basket-style flows. */
  wide?: boolean;
  children: ReactNode;
}

/**
 * Single shell for app dialogs: right-docked Sheet on desktop, bottom
 * Drawer on mobile. Bodies keep using DrawerHeader/Title/Body — neutral
 * enough for both — plus a shadcn close Button wired to onClose.
 */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  description,
  wide,
  children,
}: ResponsiveDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className={cn("gap-0 p-0", wide && "sm:max-w-lg")}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          {description && (
            <SheetDescription className="sr-only">{description}</SheetDescription>
          )}
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent>
        <DrawerTitle className="sr-only">{title}</DrawerTitle>
        {children}
      </DrawerContent>
    </Drawer>
  );
}
