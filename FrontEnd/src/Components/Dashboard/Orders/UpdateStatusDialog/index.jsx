import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";

import { STATUS_LABELS, nextStatus } from "../statusMeta";
import styles from "../styles.module.scss";

export default function UpdateStatusDialog({ order, open, onOpenChange, onConfirm }) {
  const upcoming = nextStatus(order.status);

  const handleConfirm = () => {
    if (!upcoming) {
      return;
    }

    onConfirm(upcoming);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update order #{order.id}</DialogTitle>
          <DialogDescription>
            Orders move through the workflow one step at a time.
          </DialogDescription>
        </DialogHeader>

        {upcoming ? (
          <div className={styles.StatusDialog__Current}>
            <span>{STATUS_LABELS[order.status]}</span>
            <ArrowRight size={14} className={styles.StatusDialog__Arrow} />
            <strong>{STATUS_LABELS[upcoming]}</strong>
          </div>
        ) : (
          <p>This order has no further status to move to.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleConfirm} disabled={!upcoming}>
            Mark as {upcoming ? STATUS_LABELS[upcoming] : "—"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
