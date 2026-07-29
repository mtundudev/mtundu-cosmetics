"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CART_CONFIG } from "./cart-config";

export type CartItem = {
  slug: string;
  name: string;
  priceValue: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nia-cosmetics-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      // Kikapu tupu kikianza, hakuna tatizo
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Kuhifadhi kumeshindikana; hakuathiri matumizi ya sasa
    }
  }, [items, hydrated]);

  function addItem(newItem: Omit<CartItem, "quantity">) {
    setItems((prev) => {
      const existing = prev.find((item) => item.slug === newItem.slug);
      if (existing) {
        return prev.map((item) =>
          item.slug === newItem.slug ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  }

  function removeItem(slug: string) {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }

  function updateQuantity(slug: string, quantity: number) {
    if (quantity < 1) {
      removeItem(slug);
      return;
    }
    setItems((prev) => prev.map((item) => (item.slug === slug ? { ...item, quantity } : item)));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.priceValue * item.quantity, 0),
    [items]
  );

  const deliveryFee = subtotal === 0 || subtotal >= CART_CONFIG.freeDeliveryThreshold
    ? 0
    : CART_CONFIG.deliveryFee;

  const total = subtotal + deliveryFee;

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        deliveryFee,
        total,
        itemCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart lazima itumike ndani ya CartProvider");
  }
  return context;
}
