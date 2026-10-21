
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";

import styles from "./styles.module.scss";
import { useCart } from "../../../Context/CartContext.jsx";
import { useStoreBranding } from "../../../Context/StoreBrandingContext.jsx";

import { Button } from "@/Components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/Components/ui/sheet";

import {
  fetchStoreProducts,
  resolveStoreImageUrl,
} from "@/lib/storeData";

const links = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Categories", href: "/categories" },
  { name: "About", href: "/about" },
];

const accountLink = {
  name: "Login",
  href: "/login",
};

export default function Navbar() {
  const navigate = useNavigate();
  const { cartCount, openCartDrawer } = useCart();
  const { name: storeName, logoUrl } = useStoreBranding();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (!searchOpen || products.length > 0) {
      return;
    }

    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);

        const productData = await fetchStoreProducts();

        if (!cancelled) {
          setProducts(
            Array.isArray(productData) ? productData : []
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching search products:", error);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [searchOpen, products.length]);

  const searchResults = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products
      .filter((product) => {
        const productName = String(product.name || "").toLowerCase();
        const brandName = String(
          product.brand_name || ""
        ).toLowerCase();

        return (
          productName.includes(query) ||
          brandName.includes(query)
        );
      })
      .slice(0, 8);
  }, [products, searchValue]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    setSearchOpen(false);
    setSearchValue("");

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleProductClick = (productId) => {
    setSearchOpen(false);
    setSearchValue("");
    navigate(`/shop/${productId}`);
  };

  const handleCloseSearch = () => {
    setSearchOpen(false);
    setSearchValue("");
  };

  return (
    <>
      <header className={styles.Navbar}>
        <div className={styles.Navbar__Container}>
          {/* Logo */}
          <Link to="/" className={styles.Navbar__Logo}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                className={styles.Navbar__LogoImage}
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav
            className={styles.Navbar__Links}
            aria-label="Main navigation"
          >
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
            {/* Search */}
            <div className={styles.Navbar__LeftActions}>
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

            {/* Cart + Mobile Menu */}
            <div className={styles.Navbar__RightActions}>
              <button
                type="button"
                className={styles.Navbar__Cart}
                onClick={openCartDrawer}
                aria-label={`السلة، ${cartCount} منتجات`}
              >
                <ShoppingCart aria-hidden="true" />

                {cartCount > 0 && (
                  <span
                    className={styles.Navbar__CartBadge}
                    aria-label={`${cartCount} منتجات في السلة`}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              <Sheet>
                <SheetTrigger
                  render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.Navbar__Menu}
                    aria-label="Open menu"
                  >
                    <Menu />
                  </Button>
                  }
                />

                <SheetContent
                  side="right"
                  className={styles.MobileMenu}
                >
                  <SheetHeader>
                    <SheetTitle
                      className={styles.MobileMenu__Title}
                    >
                      <Link to="/">
                        {logoUrl && (
                          <img
                            src={logoUrl}
                            alt={`${storeName} logo`}
                          />
                        )}
                      </Link>
                    </SheetTitle>
                  </SheetHeader>

                  <nav
                    className={styles.MobileMenu__Links}
                    aria-label="Mobile navigation"
                  >
                    {links.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={styles.MobileMenu__Link}
                      >
                        <span>{link.name}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}

                    <Link
                      to="/cart"
                      className={styles.MobileMenu__Link}
                    >
                      <span>
                        السلة
                        {cartCount > 0 ? ` (${cartCount})` : ""}
                      </span>
                      <span aria-hidden="true">←</span>
                    </Link>
                  </nav>

                  <div className={styles.MobileMenu__Bottom}>
                    <p>
                      © 2026{" "}
                      <Link to={accountLink.href}>
                        <span className={styles.Navbar__Mobilelogin}>
                          {storeName}
                        </span>
                      </Link>
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Search Popup */}
      {searchOpen && (
        <div
          className={styles.SearchOverlay}
          onClick={handleCloseSearch}
        >
          <div
            className={styles.SearchPopup}
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.SearchPopup__Header}>
              <h2>Search {storeName}</h2>

              <button
                type="button"
                className={styles.SearchPopup__Close}
                onClick={handleCloseSearch}
                aria-label="Close search"
              >
                <X />
              </button>
            </div>

            {/* Search Input */}
            <form
              className={styles.SearchPopup__InputWrapper}
              onSubmit={handleSearchSubmit}
            >
              <Search
                className={styles.SearchPopup__SearchIcon}
              />

              <input
                type="text"
                value={searchValue}
                onChange={(event) =>
                  setSearchValue(event.target.value)
                }
                placeholder="Search for gaming gear..."
                autoFocus
                aria-label="Search products"
                className={styles.SearchPopup__Input}
              />
            </form>

            {/* Results */}
            {searchValue.trim() && (
              <div className={styles.SearchPopup__Results}>
                {loadingProducts ? (
                  <div className={styles.SearchPopup__State}>
                    Searching products...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((product) => {
                    const image = resolveStoreImageUrl(
                      product.images?.[0]
                    );

                    const currentPrice =
                      product.is_on_sale &&
                      product.discount_price != null
                        ? product.discount_price
                        : product.price;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        className={styles.SearchPopup__Result}
                        onClick={() =>
                          handleProductClick(product.id)
                        }
                      >
                        <div
                          className={styles.SearchPopup__ResultImage}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                            />
                          ) : (
                            <Search />
                          )}
                        </div>

                        <div
                          className={styles.SearchPopup__ResultInfo}
                        >
                          {product.brand_name && (
                            <span
                              className={
                                styles.SearchPopup__ResultBrand
                              }
                            >
                              {product.brand_name}
                            </span>
                          )}

                          <strong
                            className={
                              styles.SearchPopup__ResultName
                            }
                          >
                            {product.name}
                          </strong>

                          <span
                            className={
                              styles.SearchPopup__ResultPrice
                            }
                          >
                            {Number(
                              currentPrice || 0
                            ).toLocaleString()}{" "}
                            DA
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className={styles.SearchPopup__State}>
                    No products found for "{searchValue}"
                  </div>
                )}
              </div>
            )}

            {!searchValue.trim() && (
              <p className={styles.SearchPopup__Hint}>
                Search for mice, keyboards, headsets,
                controllers and more.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
