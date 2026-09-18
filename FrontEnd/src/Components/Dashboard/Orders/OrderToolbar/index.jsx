import { RotateCcw, Search } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/Components/ui/input-group";
import { Select, SelectItem } from "@/Components/ui/select";

import { STATUS_FLOW, STATUS_LABELS, PAYMENT_LABELS } from "../statusMeta";
import styles from "./styles.module.scss";

export default function OrderToolbar({ filters, onChange, onReset }) {
  const update = (field, value) => onChange(field, value);

  return (
    <div className={styles.OrderToolbar}>
      <InputGroup className={styles.OrderToolbar__Search}>
        <InputGroupAddon>
          <Search size={17} />
        </InputGroupAddon>

        <InputGroupInput
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder="Search by order #, customer or phone..."
          aria-label="Search orders"
        />
      </InputGroup>

      <div className={styles.OrderToolbar__Filters}>
        <Select
          value={filters.status}
          onValueChange={(value) => update("status", value)}
          className={styles.OrderToolbar__Select}
          aria-label="Filter by status"
        >
          <SelectItem value="">All Status</SelectItem>
          {STATUS_FLOW.concat("cancelled").map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </Select>

        <Select
          value={filters.paymentStatus}
          onValueChange={(value) => update("paymentStatus", value)}
          className={styles.OrderToolbar__Select}
          aria-label="Filter by payment status"
        >
          <SelectItem value="">All Payments</SelectItem>
          {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </Select>

        <Select
          value={filters.deliveryType}
          onValueChange={(value) => update("deliveryType", value)}
          className={styles.OrderToolbar__Select}
          aria-label="Filter by delivery type"
        >
          <SelectItem value="">All Delivery</SelectItem>
          <SelectItem value="home">Home delivery</SelectItem>
          <SelectItem value="office">Office delivery</SelectItem>
        </Select>

        <div className={styles.OrderToolbar__DateRange}>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => update("dateFrom", event.target.value)}
            aria-label="From date"
          />

          <span>—</span>

          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => update("dateTo", event.target.value)}
            aria-label="To date"
          />
        </div>

        <button type="button" className={styles.OrderToolbar__Reset} onClick={onReset}>
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
