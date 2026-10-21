
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";

import { useCart } from "../../Context/CartContext";
import { resolveStoreImageUrl } from "@/lib/storeData";
import OrderForm from "../../Components/ProductDetails/OrderForm";
import Navbar from "@/Components/TopSection/Navbar";
import { useStoreBranding } from "../../Context/StoreBrandingContext";

import styles from "./styles.module.scss";

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("ar-DZ")} دج`;
}

export default function CartPage() {
  const { name: storeName } = useStoreBranding();
  const [orderComplete, setOrderComplete] = useState(false);
  const {
    cartItems,
    cartCount,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const isEmpty = cartItems.length === 0;

  const handleOrderSuccess = () => {
    clearCart();
    setOrderComplete(true);
  };

  return (
    <>
    <Navbar />
    <main className={styles.Cart}>
      <div className={styles.Cart__Container}>
        <header className={styles.Cart__Header}>
          <div>
            <p className={styles.Cart__Eyebrow}>{storeName}</p>
            <h1>سلة التسوق</h1>
            <p className={styles.Cart__Description}>
              راجع منتجاتك قبل إتمام الطلب.
            </p>
          </div>

          {!isEmpty && (
            <span className={styles.Cart__Count}>
              {cartCount} منتج
            </span>
          )}
        </header>

        {isEmpty ? (
          <section className={styles.Cart__Empty}>
            <div className={styles.Cart__EmptyIcon}>
              <ShoppingCart size={36} />
            </div>

            <h2>سلتك فارغة</h2>
            <p>لم تضف أي منتجات إلى سلة التسوق بعد.</p>

            <Link
              to="/shop"
              className={styles.Cart__PrimaryButton}
            >
              <ArrowLeft size={18} />
              متابعة التسوق
            </Link>
          </section>
        ) : (
          <div className={styles.Cart__Layout}>
            <section className={styles.Cart__Items}>
              <div className={styles.Cart__ItemsHeader}>
                <h2>المنتجات في سلتك</h2>

                <button
                  type="button"
                  className={styles.Cart__ClearButton}
                  onClick={clearCart}
                >
                  إفراغ السلة
                </button>
              </div>

              {cartItems.map((item) => {
                const imageUrl = resolveStoreImageUrl(item.image);

                return (
                  <article
                    key={item.key}
                    className={styles.CartItem}
                    dir="rtl"
                  >
                    <Link
                      to={`/shop/${item.productId}`}
                      className={styles.CartItem__ImageLink}
                      aria-label={`عرض ${item.name}`}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className={styles.CartItem__Image}
                        />
                      ) : (
                        <div className={styles.CartItem__ImagePlaceholder}>
                          <ShoppingCart size={26} />
                        </div>
                      )}
                    </Link>

                    <div className={styles.CartItem__Details}>
                      {item.brand && (
                        <span className={styles.CartItem__Brand}>
                          {item.brand}
                        </span>
                      )}

                      <Link
                        to={`/shop/${item.productId}`}
                        className={styles.CartItem__Name}
                      >
                        {item.name}
                      </Link>

                      {Object.entries(item.variants || {}).map(
                        ([variantName, variantValue]) => (
                          <p
                            key={variantName}
                            className={styles.CartItem__Variant}
                          >
                            {variantName}:                             {String(variantValue?.value ?? variantValue)}
                          </p>
                        )
                      )}

                      <span className={styles.CartItem__UnitPrice}>
                        {formatPrice(item.price)}
                      </span>

                      <div className={styles.CartItem__MobileActions}>
                        <div
                          className={styles.CartItem__Quantity}
                          aria-label="تعديل الكمية"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            aria-label="تقليل الكمية"
                          >
                            <Minus size={15} />
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
                            <Plus size={15} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className={styles.CartItem__Remove}
                          onClick={() => removeFromCart(item.key)}
                        >
                          <Trash2 size={16} />
                          إزالة
                        </button>
                      </div>
                    </div>

                    <div className={styles.CartItem__End}>
                      <strong className={styles.CartItem__LineTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </strong>

                      <div
                        className={styles.CartItem__Quantity}
                        aria-label="تعديل الكمية"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.key, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          aria-label="تقليل الكمية"
                        >
                          <Minus size={15} />
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
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.CartItem__Remove}
                        onClick={() => removeFromCart(item.key)}
                      >
                        <Trash2 size={16} />
                        إزالة
                      </button>
                    </div>
                  </article>
                );
              })}

              <Link
                to="/shop"
                className={styles.Cart__ContinueLink}
              >
                <ArrowLeft size={17} />
                متابعة التسوق
              </Link>
            </section>

            <aside className={styles.Cart__Checkout} dir="rtl">
              <OrderForm
                cartItems={cartItems}
                onOrderSuccess={handleOrderSuccess}
              />
            </aside>
          </div>
        )}
      </div>
    </main>
    {orderComplete && (
      <div className={styles.OrderSuccess__Overlay}>
        <section
          className={styles.OrderSuccess__Popup}
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-success-title"
          aria-describedby="order-success-description"
          dir="rtl"
        >
          <button
            type="button"
            className={styles.OrderSuccess__Close}
            onClick={() => setOrderComplete(false)}
            aria-label="إغلاق"
          >
            <X size={19} />
          </button>

          <div className={styles.OrderSuccess__Icon}>
            <CheckCircle2 size={58} aria-hidden="true" />
          </div>

          <p className={styles.OrderSuccess__Eyebrow}>
            شكراً لثقتك بنا
          </p>
          <h2 id="order-success-title">
            تم استلام طلبك بنجاح
          </h2>
          <p
            id="order-success-description"
            className={styles.OrderSuccess__Description}
          >
            شكراً لطلبك، سنتصل بك قريباً لتأكيد الطلب.
          </p>

          <Link
            to="/shop"
            className={styles.OrderSuccess__Button}
            onClick={() => setOrderComplete(false)}
          >
            متابعة التسوق
          </Link>
        </section>
      </div>
    )}
    </>
  );
}
