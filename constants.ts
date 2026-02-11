
import { Product, User, SystemConfig } from './types';

export const INITIAL_CATEGORIES = ['Food', 'Drink', 'Snack', 'Dessert'];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Classic Wagyu Burger',
    price: 85000,
    costPrice: 45000,
    category: 'Food',
    image: 'https://picsum.photos/seed/burger/400/300',
    description: 'Premium wagyu beef patty with truffle mayo and brioche bun.',
    stock: 50
  },
  {
    id: '2',
    name: 'Iced Caramel Macchiato',
    price: 42000,
    costPrice: 15000,
    category: 'Drink',
    image: 'https://picsum.photos/seed/coffee/400/300',
    description: 'Freshly brewed espresso with steamed milk and vanilla syrup.',
    stock: 100
  },
  {
    id: '3',
    name: 'Truffle Fries',
    price: 35000,
    costPrice: 12000,
    category: 'Snack',
    image: 'https://picsum.photos/seed/fries/400/300',
    description: 'Crispy golden fries tossed in aromatic truffle oil and parmesan.',
    stock: 30
  },
  {
    id: '4',
    name: 'New York Cheesecake',
    price: 45000,
    costPrice: 20000,
    category: 'Dessert',
    image: 'https://picsum.photos/seed/cake/400/300',
    description: 'Creamy cheesecake on a buttery graham cracker crust.',
    stock: 20
  }
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'admin', password: '123', role: 'Admin' },
  { id: 'u2', username: 'kasir1', password: '123', role: 'Cashier' },
  { id: 'u3', username: 'waiter1', password: '123', role: 'Waiter' }
];

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  storeName: 'LuminaPOS Resto',
  address: 'Jl. Menteng Raya No. 42, Jakarta',
  phone: '(021) 555-0123',
  logo: '',
  printerWidth: '80mm',
  printerFontSize: 'Medium'
};
