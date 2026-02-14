'use server';

import { collection, addDoc, serverTimestamp, getFirestore, Firestore } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '@/firebase/config';
import type { CartItem, CustomerInfo } from "@/lib/types";

function getFirestoreInstance(): Firestore {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getFirestore(app);
}


export async function placeOrder(customerInfo: CustomerInfo, items: CartItem[], deliveryCharge: number): Promise<{ success: boolean; id?: string; error?: string }> {
  console.log('[Server Action] placeOrder initiated.');

  // 1. Validate input
  if (!customerInfo.fullName || !customerInfo.mobile || !customerInfo.address || !customerInfo.shippingZone || !items || items.length === 0) {
      const errorMsg = 'Invalid order data. All customer fields and at least one item are required.';
      console.error('[Server Action] Validation failed:', errorMsg);
      return { success: false, error: errorMsg };
  }
  
  const firestore = getFirestoreInstance();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal + deliveryCharge;

  const orderProducts = items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      size: item.size || null
  }));

  const newOrder = {
    fullName: customerInfo.fullName,
    mobilePhoneNumber: customerInfo.mobile,
    address: customerInfo.address,
    shippingZone: customerInfo.shippingZone,
    email: customerInfo.email || "",
    orderNotes: customerInfo.notes || "",
    products: orderProducts,
    subtotal: subtotal,
    deliveryCharge: deliveryCharge,
    totalAmount: totalAmount,
    paymentMethod: 'COD',
    orderStatus: 'Pending',
    createdAt: serverTimestamp(),
  };

  try {
    console.log('[Server Action] Preparing to write to Firestore with data:', newOrder);
    const ordersCollection = collection(firestore, 'orders');
    const docRef = await addDoc(ordersCollection, newOrder);
    
    console.log(`[Server Action] Successfully wrote to Firestore. Document ID: ${docRef.id}`);
    return { success: true, id: docRef.id };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('[Server Action] Firestore write error:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
