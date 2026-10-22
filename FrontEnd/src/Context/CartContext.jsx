
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "dominos_cart_v1";

function createCartItemKey(productId, variants = {}) {
  const normalizedVariants = Object.fromEntries(
    Object.entries(variants).sort(([a], [b]) =>
      a.localeCompare(b)
    )
  );

  return `${productId}:${JSON.stringify(normalizedVariants)}`;
}

function loadCart() {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);

    if (!savedCart) return [];

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Cart remains available for the current session if storage is unavailable.
    }
  }, [cartItems]);

  /*
   * Supports both:
   * addToCart(product, quantity, selectedVariants)
   * addToCart(product, selectedVariants, quantity)
   */
  const addToCart = useCallback(
    (product, quantityOrVariants = 1, variantsOrQuantity = {}) => {
      if (!product?.id) {
        
        return false;
      }

      let quantity;
      let selectedVariants;

      if (
        quantityOrVariants !== null &&
        typeof quantityOrVariants === "object" &&
        !Array.isArray(quantityOrVariants)
      ) {
        // Legacy order: product, variants, quantity
        selectedVariants = quantityOrVariants;

        quantity =
          typeof variantsOrQuantity === "number" ||
          typeof variantsOrQuantity === "string"
            ? variantsOrQuantity
            : 1;
      } else {
        // Standard order: product, quantity, variants
        selectedVariants =
  variantsOrQuantity &&
  typeof variantsOrQuantity === "object" &&
  !Array.isArray(variantsOrQuantity)
    ? variantsOrQuantity
    : {};
      }

      const stock = Number(product.stock);
      const amount = Math.floor(Number(quantity));

      if (!Number.isFinite(stock) || stock <= 0) {
        
        return false;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        
        return false;
      }

      const unitPrice = Number(
        product.is_on_sale && product.discount_price != null
          ? product.discount_price
          : product.price
      );

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        
        return false;
      }

      const variants = { ...selectedVariants };
      const key = createCartItemKey(product.id, variants);
      setIsCartDrawerOpen(true);

      setCartItems((previousItems) => {
        const existingItem = previousItems.find(
          (item) => item.key === key
        );

        if (existingItem) {
          return previousItems.map((item) =>
            item.key === key
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + amount,
                    stock
                  ),
                  stock,
                  price: unitPrice,
                }
              : item
          );
        }

        return [
          ...previousItems,
          {
            key,
            productId: Number(product.id),
            name: product.name ?? "Product",
            brand: product.brand_name ?? "",
            image: product.images?.[0] ?? null,
            price: unitPrice,
            stock,
            quantity: Math.min(amount, stock),
            variants,
          },
        ];
      });

      // Reports whether validation passed and the item was accepted.
      return true;
    },
    []
  );

  const removeFromCart = useCallback((key) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.key !== key)
    );
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    const amount = Math.floor(Number(quantity));

    if (!Number.isFinite(amount)) return;

    setCartItems((previousItems) =>
      previousItems.map((item) => {
        if (item.key !== key) return item;

        return {
          ...item,
          quantity: Math.max(
            1,
            Math.min(amount, Number(item.stock))
          ),
        };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) * Number(item.quantity || 0),
        0
      ),
    [cartItems]
  );

  const value = useMemo(
    () => ({
      cartItems,
      cartCount,
      cartSubtotal,
      isCartDrawerOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      openCartDrawer,
      closeCartDrawer,
    }),
    [
      cartItems,
      cartCount,
      cartSubtotal,
      isCartDrawerOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      openCartDrawer,
      closeCartDrawer,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
