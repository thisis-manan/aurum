import React, { useEffect } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import gsap from "gsap";
import { useCart } from "./CartContext";
import "./CartDrawer.css";

const FREE_SHIPPING_THRESHOLD = 15000;

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const scrollToShowcase = () => {
  document.getElementById("product-showcase")?.scrollIntoView({ behavior: "smooth" });
};

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    itemCount,
  } = useCart();

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const hasFreeShipping = remaining <= 0;


useEffect(() => {
  if (isOpen && items.length > 0) {
    const els = document.querySelectorAll(".cart-drawer .cart-item");
    gsap.fromTo(
      els,
      { opacity: 0, x: 24 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.08,
        delay: 0.15,
        ease: "power2.out",
      }
      );
    }
    
  }, [isOpen]);

  return (
    <>
      <div
        className={`cart-backdrop ${isOpen ? "cart-backdrop--visible" : ""}`}
        onClick={closeCart}
      />

      <aside
        className={`cart-drawer ${isOpen ? "cart-drawer--open" : ""}`}
        aria-hidden={!isOpen}
      >
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-group">
            <h2 className="cart-drawer__title">Cart</h2>
            <span className="cart-drawer__badge">{itemCount}</span>
          </div>
          <button className="cart-drawer__close" onClick={closeCart}>
            Close
          </button>
        </div>

        <div className="cart-drawer__items">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              <ShoppingCart
                className="cart-drawer__empty-icon"
                strokeWidth={1.2}
              />
              <p>Your cart is currently empty.</p>
              <button className="cart-drawer__empty-cta" onClick={scrollToShowcase}>
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__image">
                  <img src={item.image} alt={item.name} />
                </div>

                <div className="cart-item__details">
                  <div className="cart-item__top">
                    <h3 className="cart-item__name">{item.name}</h3>
                    <button
                      className="cart-item__remove"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      Remove
                    </button>
                  </div>

                  {item.variant && (
                    <p className="cart-item__variant">{item.variant}</p>
                  )}

                  <div className="cart-item__bottom">
                    <div className="cart-item__qty">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} strokeWidth={1.5} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                    <span className="cart-item__price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer__shipping-banner">
          {hasFreeShipping
            ? "You've unlocked free delivery"
            : `Another ${formatPrice(remaining)} to benefit from free delivery`}
        </div>

        <div className="cart-drawer__summary">
          <div className="cart-drawer__row">
            <span>Shipping</span>
            <span>Calculated in the next step</span>
          </div>
          <div className="cart-drawer__row cart-drawer__row--total">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button className="cart-drawer__checkout-full" disabled={items.length === 0}>
          Proceed to Checkout — {formatPrice(subtotal)}
        </button>
      </aside>
    </>
  );
}