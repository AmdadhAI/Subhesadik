'use client';

import type { CartItem, ProductVariant } from '@/lib/types';
import type { SerializedProduct } from '@/types/serialized';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from './use-toast';

interface CartState {
  items: CartItem[];
  addItem: (product: SerializedProduct, variant: ProductVariant, quantity: number, showToast?: boolean) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      
      addItem: (product, variant, quantity, showToast = true) => {
        const currentItems = get().items;
        const cartId = `${product.id}-${variant.name}`;
        const existingItem = currentItems.find((item) => item.id === cartId);

        let newItems;
        if (existingItem) {
          newItems = currentItems.map((item) =>
            item.id === cartId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [
            ...currentItems,
            {
              id: cartId,
              productId: product.id,
              name: product.name,
              price: variant.price,
              image: product.images[0],
              quantity,
              variantName: variant.name,
            },
          ];
        }
        
        if (showToast) {
          toast({
              title: "Added to cart!",
              description: `${quantity} x ${product.name} ${variant.name ? `(${variant.name})` : ''} has been added.`,
          });
        }

        set(state => ({ ...state, items: newItems, ...calculateTotals(newItems) }));
      },

      removeItem: (itemId) => {
        const newItems = get().items.filter((item) => item.id !== itemId);
        set(state => ({ ...state, items: newItems, ...calculateTotals(newItems) }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(itemId);
        } else {
            const newItems = get().items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            );
            set(state => ({ ...state, items: newItems, ...calculateTotals(newItems) }));
        }
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0, isCartOpen: false });
      },
    }),
    {
      name: 'subhe-sadik-cart-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrate: (state) => {
        if (state) {
            const totals = calculateTotals(state.items);
            state.totalItems = totals.totalItems;
            state.totalPrice = totals.totalPrice;
        }
      }
    }
  )
);

function calculateTotals(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

export const useCart = () => {
    const store = useCartStore();
    return store;
}
