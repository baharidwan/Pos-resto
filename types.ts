
export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface Table {
  id: string;
  name: string;
  status: 'Available' | 'Occupied';
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'Admin' | 'Cashier' | 'Waiter';
}

export interface SystemConfig {
  storeName: string;
  address: string;
  phone: string;
  logo: string;
  printerWidth: '58mm' | '80mm';
  printerFontSize: 'Small' | 'Medium' | 'Large';
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  timestamp: number;
  tableNumber?: string;
  status: 'pending' | 'completed' | 'cancelled';
  cashReceived?: number;
  change?: number;
}

export type View = 'pos' | 'inventory' | 'orders' | 'reports' | 'qr' | 'settings';
