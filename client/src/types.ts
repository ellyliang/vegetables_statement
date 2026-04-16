export interface Merchant {
  id: number | string;
  name: string;
  address: string;
  contact: string;
}

export interface Order {
  id: number | string;
  vegetable: string;
  weight: number | string;
  price: number | string;
  stallId: number | string;
  completed: boolean;
}

export interface Settlement {
  id: number | string;
  stallId: number | string;
  amount: number;
  date: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}
