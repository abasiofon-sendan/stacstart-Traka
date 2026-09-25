import { Check, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DrawerHeader,
  DrawerBody,
} from "@/components/ui/drawer";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import type { DebtorEntry } from "@/store/types";

interface SettleDebtConfirmModalProps {
  open: boolean;
  onClose: () => void;
  target: DebtorEntry | null;
  onConfirm: (id: string) => void;
}

export function SettleDebtConfirmModal({ open, onClose, target, onConfirm }: SettleDebtConfirmModalProps) {
  if (!target) return null;

  const handleConfirm = () => {
    onConfirm(target.id);
    onClose();
  };

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Confirm Payment">
        <DrawerHeader>
          <div>
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              <Check weight="fill" className="h-4 w-4" />
              Confirm Payment
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X weight="bold" className="h-4 w-4" />
          </Button>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4 text-center">
            <p className="text-sm text-foreground">
              Mark <span className="font-bold">{target.name}</span>'s debt of{" "}
              <span className="font-black text-destructive">₦{target.amount.toLocaleString()}</span>{" "}
              as paid?
            </p>
          </div>
        </DrawerBody>
        <div className="flex flex-col gap-2 px-5 py-4 pb-8">
          <Button
            variant="default"
            onClick={handleConfirm}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider"
          >
            Confirm Cash Payment
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Go Back
          </Button>
        </div>
    </ResponsiveDialog>
  );
}
