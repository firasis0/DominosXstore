import { Search, RotateCcw } from "lucide-react";

import styles from "./styles.module.scss";

export default function CustomerToolbar({
    search,
    province,
    hasOrders,
    provinces,
    onSearchChange,
    onProvinceChange,
    onHasOrdersChange,
    onReset,
}) {
    return (
        <section className={styles.CustomerToolbar}>
            <div className={styles.CustomerToolbar__Search}>
                <Search size={17} />

                <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                        onSearchChange(event.target.value)
                    }
                    placeholder="Search name or phone..."
                />
            </div>

            <select
                value={province}
                onChange={(event) =>
                    onProvinceChange(event.target.value)
                }
                className={styles.CustomerToolbar__Select}
            >
                <option value="">All provinces</option>

                {provinces.map((item) => {
                    const id = item?.id ?? item?.province_id;
                    const name =
                        item?.name ??
                        item?.province ??
                        item?.province_name;

                    return (
                        <option
                            key={id ?? name}
                            value={name || id || ""}
                        >
                            {name}
                        </option>
                    );
                })}
            </select>

            <select
                value={hasOrders}
                onChange={(event) =>
                    onHasOrdersChange(event.target.value)
                }
                className={styles.CustomerToolbar__Select}
            >
                <option value="">All customers</option>
                <option value="true">With orders</option>
                <option value="false">Without orders</option>
            </select>

            <button
                type="button"
                className={styles.CustomerToolbar__Reset}
                onClick={onReset}
            >
                <RotateCcw size={15} />
                <span>Reset</span>
            </button>
        </section>
    );
}
