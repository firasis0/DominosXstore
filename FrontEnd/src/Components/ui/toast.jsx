import { Check, Info, X, AlertTriangle } from "lucide-react";

import styles from "./toast.module.scss";

const icons = {
    success: Check,
    info: Info,
    warning: AlertTriangle,
};

export default function Toast({
    type = "success",
    message,
    onClose,
}) {
    const Icon = icons[type] || Check;

    return (
        <div
            className={`${styles.Toast} ${styles[`Toast--${type}`]}`}
            role="status"
        >
            <div className={styles.Toast__Icon}>
                <Icon size={16} />
            </div>

            <p className={styles.Toast__Message}>
                {message}
            </p>

            <button
                type="button"
                className={styles.Toast__Close}
                onClick={onClose}
                aria-label="Close notification"
            >
                <X size={15} />
            </button>
        </div>
    );
}