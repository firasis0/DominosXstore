import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import styles from "./styles.module.scss";

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
                        Array.isArray(productData)
                            ? productData
                            : []
                    );
                }
            } catch (error) {
                if (!cancelled) {
                    console.error(
                        "Error fetching search products:",
                        error
                    );

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
                const productName = String(
                    product.name || ""
                ).toLowerCase();

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

        navigate(
            `/shop?search=${encodeURIComponent(query)}`
        );
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
            {/* ==============================
                NAVBAR
            ============================== */}

            <header className={styles.Navbar}>
                <div className={styles.Navbar__Container}>
                    {/* Logo */}

                    <Link
                        to="/"
                        className={styles.Navbar__Logo}
                    >
                        <img
                            src="/images/logo/dominos_logo.jpg"
                            alt="DOMINOS Logo"
                            className={
                                styles.Navbar__LogoImage
                            }
                        />
                    </Link>

                    {/* Desktop Navigation */}

                    <nav className={styles.Navbar__Links}>
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={
                                    styles.Navbar__Link
                                }
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}

                    <div className={styles.Navbar__Actions}>
                        {/* Search */}

                        <div
                            className={
                                styles.Navbar__LeftActions
                            }
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className={
                                    styles.Navbar__Action
                                }
                                onClick={() =>
                                    setSearchOpen(true)
                                }
                                aria-label="Search"
                            >
                                <Search />
                            </Button>
                        </div>

                        {/* Account + Mobile Menu */}

                        <div
                            className={
                                styles.Navbar__RightActions
                            }
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                className={
                                    styles.Navbar__Action
                                }
                                aria-label="Account"
                                asChild
                            >
                                <Link to={accountLink.href}>
                                    <UserRound />
                                </Link>
                            </Button>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={
                                            styles.Navbar__Menu
                                        }
                                        aria-label="Open menu"
                                    >
                                        <Menu />
                                    </Button>
                                </SheetTrigger>

                                <SheetContent
                                    side="right"
                                    className={
                                        styles.MobileMenu
                                    }
                                >
                                    <SheetHeader>
                                        <SheetTitle
                                            className={
                                                styles.MobileMenu__Title
                                            }
                                        >
                                            <Link to="/">
                                                <img
                                                    src="/images/logo/dominos_logo.jpg"
                                                    alt="DOMINOS Logo"
                                                />
                                            </Link>
                                        </SheetTitle>
                                    </SheetHeader>

                                    <nav
                                        className={
                                            styles.MobileMenu__Links
                                        }
                                    >
                                        {links.map((link) => (
                                            <Link
                                                key={link.name}
                                                to={link.href}
                                                className={
                                                    styles.MobileMenu__Link
                                                }
                                            >
                                                <span>
                                                    {link.name}
                                                </span>

                                                <span>
                                                    →
                                                </span>
                                            </Link>
                                        ))}
                                    </nav>

                                    <div
                                        className={
                                            styles.MobileMenu__Bottom
                                        }
                                    >
                                        <p>
                                            © 2026 DOMINOS
                                        </p>
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
                    onClick={handleCloseSearch}
                >
                    <div
                        className={styles.SearchPopup}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        {/* Header */}

                        <div
                            className={
                                styles.SearchPopup__Header
                            }
                        >
                            <h2>Search DOMINOS</h2>

                            <button
                                type="button"
                                className={
                                    styles.SearchPopup__Close
                                }
                                onClick={handleCloseSearch}
                                aria-label="Close search"
                            >
                                <X />
                            </button>
                        </div>

                        {/* Search Input */}

                        <form
                            className={
                                styles.SearchPopup__InputWrapper
                            }
                            onSubmit={handleSearchSubmit}
                        >
                            <Search
                                className={
                                    styles.SearchPopup__SearchIcon
                                }
                            />

                            <input
                                type="text"
                                value={searchValue}
                                onChange={(event) =>
                                    setSearchValue(
                                        event.target.value
                                    )
                                }
                                placeholder="Search for gaming gear..."
                                autoFocus
                                aria-label="Search products"
                                className={
                                    styles.SearchPopup__Input
                                }
                            />
                        </form>

                        {/* Results */}

                        {searchValue.trim() && (
                            <div
                                className={
                                    styles.SearchPopup__Results
                                }
                            >
                                {loadingProducts ? (
                                    <div
                                        className={
                                            styles.SearchPopup__State
                                        }
                                    >
                                        Searching products...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(
                                        (product) => {
                                            const image =
                                                resolveStoreImageUrl(
                                                    product
                                                        .images?.[0]
                                                );

                                            const currentPrice =
                                                product.is_on_sale &&
                                                product.discount_price !=
                                                    null
                                                    ? product.discount_price
                                                    : product.price;

                                            return (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    className={
                                                        styles.SearchPopup__Result
                                                    }
                                                    onClick={() =>
                                                        handleProductClick(
                                                            product.id
                                                        )
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.SearchPopup__ResultImage
                                                        }
                                                    >
                                                        {image ? (
                                                            <img
                                                                src={
                                                                    image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />
                                                        ) : (
                                                            <Search />
                                                        )}
                                                    </div>

                                                    <div
                                                        className={
                                                            styles.SearchPopup__ResultInfo
                                                        }
                                                    >
                                                        {product.brand_name && (
                                                            <span
                                                                className={
                                                                    styles.SearchPopup__ResultBrand
                                                                }
                                                            >
                                                                {
                                                                    product.brand_name
                                                                }
                                                            </span>
                                                        )}

                                                        <strong
                                                            className={
                                                                styles.SearchPopup__ResultName
                                                            }
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </strong>

                                                        <span
                                                            className={
                                                                styles.SearchPopup__ResultPrice
                                                            }
                                                        >
                                                            {Number(
                                                                currentPrice ||
                                                                    0
                                                            ).toLocaleString()}{" "}
                                                            DA
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        }
                                    )
                                ) : (
                                    <div
                                        className={
                                            styles.SearchPopup__State
                                        }
                                    >
                                        No products found for "
                                        {searchValue}"
                                    </div>
                                )}
                            </div>
                        )}

                        {!searchValue.trim() && (
                            <p
                                className={
                                    styles.SearchPopup__Hint
                                }
                            >
                                Search for mice, keyboards,
                                headsets, controllers and more.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}