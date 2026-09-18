import { useState } from "react";
import { Eye, MoreVertical, Printer, RefreshCw, XCircle } from "lucide-react";

import { TableCell, TableRow } from "@/Components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

import { STATUS_LABELS, PAYMENT_LABELS, isTerminalStatus } from "../statusMeta";
import OrderDetailsSheet from "../OrderDetailsSheet";
import UpdateStatusDialog from "../UpdateStatusDialog";
import { printOrder } from "../printOrder";
import styles from "../styles.module.scss";

const formatPrice = (price) => `${Number(price || 0).toLocaleString("fr-DZ")} DA`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

export default function OrderRow({ order, onFetchDetails, onUpdateStatus, onCancel }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  const locked = isTerminalStatus(order.status);

  const handlePrint = async () => {
    setPrinting(true);

    try {
      const details = await onFetchDetails(order.id);
      printOrder(details);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <div className={styles.Orders__Order}>
            <strong>#{order.id}</strong>
            <span>{order.item_count} {order.item_count === 1 ? "item" : "items"}</span>
          </div>
        </TableCell>

        <TableCell>
          <div className={styles.Orders__Customer}>
            <strong>{order.customer_name}</strong>
            <span>{order.customer_phone}</span>
          </div>
        </TableCell>

        <TableCell className={styles.Orders__Cell}>{formatPrice(order.total)}</TableCell>

        <TableCell>
          <span className={`${styles.Status} ${styles[`Payment--${order.payment_status}`]}`}>
            {PAYMENT_LABELS[order.payment_status] || order.payment_status}
          </span>
        </TableCell>

        <TableCell className={styles.Orders__Cell}>
          {order.delivery_type === "office" ? "Office" : "Home"}
          {order.shipping_provider_name && (
            <div className={styles.Orders__Muted}>{order.shipping_provider_name}</div>
          )}
        </TableCell>

        <TableCell>
          <span className={`${styles.Status} ${styles[`Status--${order.status}`]}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </TableCell>

        <TableCell className={styles.Orders__Cell}>{formatDate(order.created_at)}</TableCell>

        <TableCell>
          <div className={styles.Orders__Actions}>
            <DropdownMenu>
              <DropdownMenuTrigger className={styles.Orders__ActionsTrigger} aria-label={`Actions for order #${order.id}`}>
                <MoreVertical size={16} />
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSheetOpen(true)}>
                  <Eye size={14} />
                  View Order
                </DropdownMenuItem>

                <DropdownMenuItem disabled={locked} onClick={() => setStatusOpen(true)}>
                  <RefreshCw size={14} />
                  Update Status
                </DropdownMenuItem>

                <DropdownMenuItem disabled={printing} onClick={handlePrint}>
                  <Printer size={14} />
                  Print Order
                </DropdownMenuItem>

                <DropdownMenuItem variant="destructive" disabled={locked} onClick={() => setCancelOpen(true)}>
                  <XCircle size={14} />
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      </TableRow>

      <OrderDetailsSheet
        orderId={order.id}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onFetchDetails={onFetchDetails}
      />

      <UpdateStatusDialog
        order={order}
        open={statusOpen}
        onOpenChange={setStatusOpen}
        onConfirm={(status) => onUpdateStatus(order.id, status)}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel order #{order.id}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled and cannot be undone. The customer will need to be
              informed separately.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep order</AlertDialogCancel>
            <AlertDialogAction onClick={() => onCancel(order.id)}>Cancel order</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
