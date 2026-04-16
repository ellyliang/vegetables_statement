export interface Merchant {
  id: number;
  name: string;
  address: string;
  contact: string;
}

export interface Order {
  id: number;
  vegetable: string;
  weight: number;
  price: number;
  stallId: number;
  completed: boolean;
}

export interface Settlement {
  id: number;
  stallId: number | string;
  amount: number;
  date: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
