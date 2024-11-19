import { loadScript } from './loadScript';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  notes?: {
    [key: string]: string;
  };
  config?: {
    display?: {
      blocks?: {
        [key: string]: any;
      };
    };
  };
}

export const initializeRazorpay = async () => {
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  if (!res) {
    throw new Error('Razorpay SDK failed to load');
  }
  return true;
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  const rzp = new (window as any).Razorpay(options);
  rzp.open();
};
