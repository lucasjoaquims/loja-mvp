// src/store/cartStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem, ProductColor } from "@/types";
import { calcShipping, calcAutoDiscount } from "@/utils";

interface CartStore {
  items: CartItem[];
  couponCode: string;
  couponId: string;
  couponDiscount: number; // valor em R$
  shipping: number;
  cep: string;

  // Actions
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string, size: string, colorName: string) => void;
  updateQuantity: (productId: string, size: string, colorName: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, id: string, discount: number) => void;
  removeCoupon: () => void;
  setCep: (cep: string) => void;

  // Computed (via selectors)
  getSubtotal: () => number;
  getAutoDiscount: () => { hasDiscount: boolean; amount: number; percent: number; totalItems: number };
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      couponId: "",
      couponDiscount: 0,
      shipping: 0,
      cep: "",

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.size}-${newItem.color.name}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          let items: CartItem[];

          if (existing) {
            const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock);
            items = state.items.map((i) =>
              i.id === id ? { ...i, quantity: newQty } : i
            );
          } else {
            items = [...state.items, { ...newItem, id }];
          }

          const shipping = calcShipping(
            items.reduce((s, i) => s + i.price * i.quantity, 0),
            state.cep
          );

          return { items, shipping };
        });
      },

      removeItem: (productId, size, colorName) => {
        set((state) => {
          const id = `${productId}-${size}-${colorName}`;
          const items = state.items.filter((i) => i.id !== id);
          const shipping = calcShipping(
            items.reduce((s, i) => s + i.price * i.quantity, 0),
            state.cep
          );
          return { items, shipping };
        });
      },

      updateQuantity: (productId, size, colorName, qty) => {
        const id = `${productId}-${size}-${colorName}`;
        set((state) => {
          const items = state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i
          );
          const shipping = calcShipping(
            items.reduce((s, i) => s + i.price * i.quantity, 0),
            state.cep
          );
          return { items, shipping };
        });
      },

      clearCart: () =>
        set({ items: [], couponCode: "", couponId: "", couponDiscount: 0, shipping: 0 }),

      applyCoupon: (code, id, discount) =>
        set({ couponCode: code, couponId: id, couponDiscount: discount }),

      removeCoupon: () =>
        set({ couponCode: "", couponId: "", couponDiscount: 0 }),

      setCep: (cep) => {
        const subtotal = get().getSubtotal();
        const shipping = calcShipping(subtotal, cep);
        set({ cep, shipping });
      },

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getAutoDiscount: () => {
        const items = get().items.map((i) => ({ quantity: i.quantity, price: i.price }));
        const result = calcAutoDiscount(items);
        return {
          hasDiscount: result.hasDiscount,
          amount: result.discountAmount,
          percent: result.discountPercent,
          totalItems: result.totalItems,
        };
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const autoDiscount = get().getAutoDiscount();
        const couponDiscount = get().couponDiscount;
        const shipping = get().shipping;
        return Math.max(0, subtotal - autoDiscount.amount - couponDiscount + shipping);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "loja-mvp-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
