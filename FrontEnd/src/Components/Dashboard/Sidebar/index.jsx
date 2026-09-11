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
  LogOut,
  Menu,
  X,
  Truck 
} from "lucide-react";

import styles from "./styles.module.scss";

const navigation = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    active: true,
    href: "/dashboard",
  },
  {
    name: "Orders",
    icon: ShoppingBag,
  },
  {
    name: "Shiping",
    icon: Truck ,
  },
  {
    name: "Products",
    icon: Package,
    href: "/dashboard/products",
  },
  {
    name: "Categories",
    icon: Tags,
  },
  {
    name: "Brands",
    icon: PanelsTopLeft,
  },
  {
    name: "Customers",
    icon: Users,
  },
  {
    name: "Content",
    icon: PanelsTopLeft,
  },
];

export default function Sidebar({ activeItem = "Dashboard" }) {
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
                to={item.href || "#"}
                className={`${styles.Sidebar__Item} ${
                  item.name === activeItem
                    ? styles.Sidebar__ItemActive
                    : ""
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} strokeWidth={1.8} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.Sidebar__Bottom}>
          <button className={styles.Sidebar__Item}>
            <Settings size={19} strokeWidth={1.8} />
            <span>Settings</span>
          </button>

          <button className={styles.Sidebar__Item}>
            <LogOut size={19} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}