import { create } from 'zustand';
import { toast } from 'sonner';
import { Product } from '@/lib/generated/prisma';

export type CartItem = {
  product: Product;
  quantity: number;
  weight?: number;
};

type CartState = {
  items: CartItem[];
  mode: 'sale' | 'return';
  weighedItem: Product | null;
  ageRestrictedItem: Product | null;
  totalItems: number;
  subtotal: number;
  setMode: (mode: 'sale' | 'return') => void;
  setWeighedItem: (product: Product | null) => void;
  setAgeRestrictedItem: (product: Product | null) => void;
  loadReturnItems: (items: CartItem[]) => void; // New action
  addItem: (product: Product) => void;
  addWeighedItem: (product: Product, weight: number) => void;
  addVerifiedItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.weight ? item.product.price * item.weight * Math.sign(item.quantity) : item.product.price * item.quantity;
    return total + itemPrice;
  }, 0);
  return { totalItems, subtotal };
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mode: 'sale',
  weighedItem: null,
  ageRestrictedItem: null,
  totalItems: 0,
  subtotal: 0,

  setMode: (mode) => set({ mode, items: [], ...calculateTotals([]) }),
  setWeighedItem: (product) => set({ weighedItem: product }),
  setAgeRestrictedItem: (product) => set({ ageRestrictedItem: product }),

  // New action to load a cart for a return
  loadReturnItems: (items) => {
    set({ items, ...calculateTotals(items) });
  },

  addItem: (product) => {
    if (get().mode === 'return') {
      toast.error("Cannot add products in Return Mode.");
      return;
    }
    if (product.isAgeRestricted) {
      set({ ageRestrictedItem: product });
      return;
    }
    if (product.isWeighed) {
      set({ weighedItem: product });
      return;
    }
    const { items } = get();
    const existingItem = items.find((item) => item.product.id === product.id);
    const quantityInCart = existingItem ? existingItem.quantity : 0;

    // THIS IS THE NEW CHECK
    if (quantityInCart >= product.stockQuantity) {
      toast.error("Maximum stock reached.", {
        description: `You cannot add more of "${product.name}". Only ${product.stockQuantity} are available.`,
      });
      return;
    }

    const updatedItems = existingItem
      ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { product, quantity: 1 }];
    set({ items: updatedItems, ...calculateTotals(updatedItems) });
    toast.success(`${product.name} added to cart.`);
  },



  addVerifiedItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.product.id === product.id);
    const quantityInCart = existingItem ? existingItem.quantity : 0;

    // / THIS IS THE NEW CHECK
    if (quantityInCart >= product.stockQuantity) {
      toast.error("Maximum stock reached.");
      return;
    }

    const updatedItems = existingItem
      ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...items, { product, quantity: 1 }];
    set({ items: updatedItems, ...calculateTotals(updatedItems) });
    toast.success(`${product.name} added to cart.`);
  },

  addWeighedItem: (product, weight) => {
    if (weight <= 0) {
      toast.error("Weight must be greater than zero.");
      return;
    }
    const { items } = get();
    const updatedItems = [...items, { product, quantity: 1, weight }];
    set({ items: updatedItems, ...calculateTotals(updatedItems) });
    toast.success(`${product.name} (${weight} lbs) added to cart.`);
  },

  removeItem: (productId: string) => {
    const { items } = get();
    const itemToRemove = items.find(item => item.product.id === productId);
    const updatedItems = items.filter(item => item.product.id !== productId);
    set({ items: updatedItems, ...calculateTotals(updatedItems) });
    if (itemToRemove) toast.info(`${itemToRemove.product.name} removed from cart.`);
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get();
    const itemToUpdate = items.find(item => item.product.id === productId);
    if(!itemToUpdate) return;

    if (itemToUpdate?.product.isWeighed || get().mode === 'return') {
      toast.error("Cannot change quantity for this item.");
      return;
    }

    // / THIS IS THE NEW CHECK
    if (quantity > itemToUpdate.product.stockQuantity) {
      toast.error("Maximum stock reached.", {
        description: `Only ${itemToUpdate.product.stockQuantity} are available.`,
      });
      // Set to max available instead of doing nothing
      const updatedItems = items.map((item) => item.product.id === productId ? { ...item, quantity: itemToUpdate.product.stockQuantity } : item);
      set({ items: updatedItems, ...calculateTotals(updatedItems) });
      return;
    }

  },

  clearCart: () => {
    set({ items: [], totalItems: 0, subtotal: 0, weighedItem: null, ageRestrictedItem: null, mode: 'sale' });
  },
}));