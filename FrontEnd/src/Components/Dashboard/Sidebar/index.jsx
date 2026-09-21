import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Tags,
    Users,
    PanelsTopLeft,
    Settings,
    Menu,
    X,
    Truck,
    Store,
} from "lucide-react";
import styles from "./styles.module.scss";

const navigation = [
    {
        name: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        name: "Orders",
        icon: ShoppingBag,
        href: "/dashboard/orders",
    },
    {
        name: "Shipping",
        icon: Truck,
        href: "/dashboard/shipping",
    },
    {
        name: "Products",
        icon: Package,
        href: "/dashboard/products",
    },
    {
        name: "Categories",
        icon: Tags,
        href: "/dashboard/categories",
    },
    {
        name: "Brands",
        icon: PanelsTopLeft,
        href: "/dashboard/brands",
    },
    {
        name: "Customers",
        icon: Users,
        href: "/dashboard/customers",
    },
    {
        name: "Content",
        icon: PanelsTopLeft,
        href: "/dashboard/content",
    },
];

export default function Sidebar({
    activeItem = "Dashboard",
}) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                className={styles.Sidebar__MobileButton}
                onClick={() => setOpen(true)}
                aria-label="Open dashboard menu"
            >
                <Menu size={21} />
            </button>

            {open && (
                <div
                    className={styles.Sidebar__Overlay}
                    onClick={() => setOpen(false)}
                />
            )}

            <aside
                className={`${styles.Sidebar} ${
                    open ? styles.Sidebar__Open : ""
                }`}
            >
                <div className={styles.Sidebar__Top}>
                    <div className={styles.Sidebar__Logo}>
                        DOMINOS
                    </div>

                    <span className={styles.Sidebar__Label}>
                        ADMIN PANEL
                    </span>

                    <button
                        className={styles.Sidebar__Close}
                        onClick={() => setOpen(false)}
                        aria-label="Close dashboard menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.Sidebar__Nav}>
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`${styles.Sidebar__Item} ${
                                    item.name === activeItem
                                        ? styles.Sidebar__ItemActive
                                        : ""
                                }`}
                                onClick={() =>
                                    setOpen(false)
                                }
                            >
                                <Icon
                                    size={19}
                                    strokeWidth={1.8}
                                />

                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.Sidebar__Bottom}>
                    <Link
                        to="/dashboard/settings"
                        className={`${styles.Sidebar__Item} ${
                            activeItem === "Settings"
                                ? styles.Sidebar__ItemActive
                                : ""
                        }`}
                        onClick={() => setOpen(false)}
                    >
                        <Settings
                            size={19}
                            strokeWidth={1.8}
                        />

                        <span>Settings</span>
                    </Link>

                    <Link
                        to="/"
                        className={styles.Sidebar__Item}
                        onClick={() => setOpen(false)}
                    >
                        <Store
                            size={19}
                            strokeWidth={1.8}
                        />

                        <span>Back to Store</span>
                    </Link>
                </div>
            </aside>
        </>
    );
}