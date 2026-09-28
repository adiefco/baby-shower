export interface GiftItem {
  id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  sellingPrice: number;
  category: string;
  limit: number; // -1 = unlimited
  bought: number;
}

export interface Contribution {
  id: string;
  itemId: string;
  guestName: string;
  message: string;
  amount: number;
  paymentId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface Message {
  id: string;
  guestName: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface Database {
  items: GiftItem[];
  contributions: Contribution[];
  messages: Message[];
}

export interface CreatePaymentBody {
  itemId: string;
  guestName: string;
  message: string;
}

export interface PaymentPreference {
  preferenceId: string;
  amount: number;
  itemName: string;
}
