import { createContext, useContext, useMemo, useRef, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [flyout, setFlyout] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);
  const cartTargetRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const flyoutTimeoutRef = useRef(null);

  function triggerCartPulse() {
    setCartPulse(false);

    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current);
    }

    requestAnimationFrame(() => {
      setCartPulse(true);
      pulseTimeoutRef.current = setTimeout(() => setCartPulse(false), 650);
    });
  }

  function animateToCart({ image, fromRect }) {
    const targetRect = cartTargetRef.current?.getBoundingClientRect();

    if (!image || !fromRect || !targetRect) {
      triggerCartPulse();
      return;
    }

    const size = Math.max(72, Math.min(fromRect.width, 160));

    setFlyout({
      image,
      startX: fromRect.left + fromRect.width / 2 - size / 2,
      startY: fromRect.top + fromRect.height / 2 - size / 2,
      endX: targetRect.left + targetRect.width / 2 - size / 3,
      endY: targetRect.top + targetRect.height / 2 - size / 3,
      size,
    });

    if (flyoutTimeoutRef.current) {
      clearTimeout(flyoutTimeoutRef.current);
    }

    flyoutTimeoutRef.current = setTimeout(() => {
      setFlyout(null);
      triggerCartPulse();
    }, 700);
  }

  function addToCart(product, animation = null) {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    animateToCart(animation);
  }

  function registerCartTarget(node) {
    cartTargetRef.current = node;
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.id !== id));
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const summary = useMemo(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

    return {
      itemCount,
      subtotal,
      shipping: itemCount > 0 ? 120 : 0,
      tax: subtotal * 0.12,
      total: subtotal + (itemCount > 0 ? 120 : 0) + subtotal * 0.12,
    };
  }, [items]);

  const value = {
    items,
    summary,
    addToCart,
    updateQuantity,
    clearCart,
    registerCartTarget,
    cartPulse,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {flyout ? (
        <div
          className="cart-flyout"
          style={{
            "--flyout-size": `${flyout.size}px`,
            "--flyout-start-x": `${flyout.startX}px`,
            "--flyout-start-y": `${flyout.startY}px`,
            "--flyout-end-x": `${flyout.endX}px`,
            "--flyout-end-y": `${flyout.endY}px`,
          }}
          aria-hidden="true"
        >
          <img src={flyout.image} alt="" />
        </div>
      ) : null}
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
