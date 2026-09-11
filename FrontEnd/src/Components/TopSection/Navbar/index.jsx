import { useState } from "react";

import styles from "./styles.module.scss";

import { Link } from "react-router-dom";

import {
  Search,
  UserRound,
  Menu,
  X,
} from "lucide-react";

import { Button } from "@/Components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
];

const accountLink = { name: "Login", href: "/login" };

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      {/* ==============================
          NAVBAR
      ============================== */}

      <header className={styles.Navbar}>
        <div className={styles.Navbar__Container}>

          {/* Logo */}
          <Link to="/" className={styles.Navbar__Logo}>
            <img
              src="/images/logo/dominos_logo.jpg"
              alt="DOMINOS Logo"
              className={styles.Navbar__LogoImage}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.Navbar__Links}>
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={styles.Navbar__Link}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={styles.Navbar__Actions}>

            {/* LEFT ACTIONS */}
            <div className={styles.Navbar__LeftActions}>

              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                className={styles.Navbar__Action}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search />
              </Button>

            </div>

            {/* RIGHT ACTIONS */}
            <div className={styles.Navbar__RightActions}>

            
              

              {/* Account */}
                
              <Button
              variant="ghost"
                size="icon"
                className={styles.Navbar__Action}
                aria-label="Account"
              >
                <Link
              // className={styles.Navbar__Action}
              to={accountLink.href}
              // aria-label="Account"
              >
                <UserRound />
              </Link>
              </Button>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.Navbar__Menu}
                    aria-label="Open menu"
                  >
                    <Menu />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className={styles.MobileMenu}
                >
                  <SheetHeader>
                    <SheetTitle
                      className={styles.MobileMenu__Title}
                    >
                      <Link to='/'>
                      <img
                        src="/images/logo/dominos_logo.jpg"
                        alt="DOMINOS Logo"
                      />
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className={styles.MobileMenu__Links}>
                    {links.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={styles.MobileMenu__Link}
                      >
                        <span>{link.name}</span>
                        <span>→</span>
                      </Link>
                    ))}
                  </nav>

                  <div className={styles.MobileMenu__Bottom}>
                    <p>© 2026 DOMINOS</p>
                  </div>
                </SheetContent>
              </Sheet>

            </div>
          </div>

        </div>
      </header>

      {/* ==============================
          SEARCH POPUP
      ============================== */}

      {searchOpen && (
        <div
          className={styles.SearchOverlay}
          onClick={() => setSearchOpen(false)}
        >
          <div
            className={styles.SearchPopup}
            onClick={(event) => event.stopPropagation()}
          >

            {/* Popup Header */}
            <div className={styles.SearchPopup__Header}>
              <h2>Search DOMINOS</h2>

              <button
                type="button"
                className={styles.SearchPopup__Close}
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <X />
              </button>
            </div>

            {/* Search Input */}
            <div className={styles.SearchPopup__InputWrapper}>
              <Search />

              <input
                type="text"
                placeholder="Search for gaming gear..."
                autoFocus
                aria-label="Search products"
              />
            </div>

            {/* Hint */}
            <p className={styles.SearchPopup__Hint}>
              Search for mice, keyboards, headsets, controllers and more.
            </p>

          </div>
        </div>
      )}
    </>
  );
}