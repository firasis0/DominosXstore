import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import { useCart } from "../../Context/CartContext";
import { useStoreBranding } from "../../Context/StoreBrandingContext";
import { resolveStoreImageUrl } from "@/lib/storeData";

import styles from "./styles.module.scss";

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ar-DZ")} دج`;
}

export default function CartDrawer() {
  const { name: storeName } = useStoreBranding();
  const {
    cartItems,
    cartCount,
    cartSubtotal,
    isCartDrawerOpen,
    closeCartDrawer,
    openCartDrawer,
    removeFromCart,
    updateQuantity,
  } = useCart();

  useEffect(() => {
    if (!isCartDrawerOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCartDrawer();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow =
        previousOverflow === "hidden" ? "" : previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCartDrawer, isCartDrawerOpen]);

  return (
    <>
      {cartCount > 0 && !isCartDrawerOpen && (
        <button
          type="button"
          className={styles.CartDrawer__EdgeButton}
          onClick={openCartDrawer}
          aria-label={`فتح سلة التسوق، ${cartCount} منتجات`}
        >
          <ArrowLeft size={20} aria-hidden="true" />
          <span>{cartCount > 99 ? "99+" : cartCount}</span>
        </button>
      )}

      {isCartDrawerOpen && (
        <div className={styles.CartDrawer}>
          <button
            type="button"
            className={styles.CartDrawer__Backdrop}
            onClick={closeCartDrawer}
            aria-label="إغلاق سلة التسوق"
          />

          <aside
            className={styles.CartDrawer__Panel}
            dir="rtl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            <header className={styles.CartDrawer__Header}>
              <div>
                <p>{storeName}</p>
                <h2 id="cart-drawer-title">
                  سلة التسوق
                  {cartCount > 0 ? ` (${cartCount})` : ""}
                </h2>
              </div>
              <button
                type="button"
                className={styles.CartDrawer__Close}
                onClick={closeCartDrawer}
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </header>

            {cartItems.length === 0 ? (
              <div className={styles.CartDrawer__Empty}>
                <ShoppingCart size={38} aria-hidden="true" />
                <h3>سلتك فارغة</h3>
                <p>أضف منتجاتك المفضلة وستظهر هنا.</p>
                <Link
                  to="/shop"
                  className={styles.CartDrawer__ShopLink}
                  onClick={closeCartDrawer}
                >
                  متابعة التسوق
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.CartDrawer__Items}>
                  {cartItems.map((item) => {
                    const imageUrl = resolveStoreImageUrl(item.image);

                    return (
                      <article
                        key={item.key}
                        className={styles.CartDrawer__Item}
                      >
                        <div className={styles.CartDrawer__Image}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={item.name} />
                          ) : (
                            <ShoppingCart size={22} aria-hidden="true" />
                          )}
                        </div>

                        <div className={styles.CartDrawer__Details}>
                          {item.brand && <span>{item.brand}</span>}
                          <h3>{item.name}</h3>
                          {Object.entries(item.variants || {}).map(
                            ([name, value]) => (
                              <p key={name}>
                                {name}: {String(value?.value ?? value)}
                              </p>
                            )
                          )}
                          <strong>{formatPrice(item.price)}</strong>
                          <div className={styles.CartDrawer__Actions}>
                            <div className={styles.CartDrawer__Quantity}>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.key, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                aria-label="تقليل الكمية"
                              >
                                <Minus size={14} />
                              </button>
                              <span>{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.key, item.quantity + 1)
                                }
                                disabled={item.quantity >= item.stock}
                                aria-label="زيادة الكمية"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              type="button"
                              className={styles.CartDrawer__Remove}
                              onClick={() => removeFromCart(item.key)}
                              aria-label={`إزالة ${item.name}`}
                            >
                              <Trash2 size={15} />
                              إزالة
                            </button>
                          </div>
                        </div>
                        <strong className={styles.CartDrawer__LineTotal}>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </article>
                    );
                  })}
                </div>

                <footer className={styles.CartDrawer__Footer}>
                  <div>
                    <span>المجموع الفرعي</span>
                    <strong>{formatPrice(cartSubtotal)}</strong>
                  </div>
                  <p>يتم احتساب رسوم التوصيل عند إتمام الطلب.</p>
                  <Link
                    to="/cart"
                    className={styles.CartDrawer__Checkout}
                    onClick={closeCartDrawer}
                  >
                    أطلب الان
                    <ArrowLeft size={18} aria-hidden="true" />
                  </Link>
                </footer>
              </>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
