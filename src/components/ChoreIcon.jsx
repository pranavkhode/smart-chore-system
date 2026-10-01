import React from 'react';
import {
  Sparkles,
  Utensils,
  Trash2,
  ChefHat,
  ShowerHead,
  ShoppingCart,
  Shirt,
  Flower2,
  Dog,
  Brush,
  Home,
  CheckSquare
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  Utensils,
  Trash2,
  ChefHat,
  ShowerHead,
  ShoppingCart,
  Shirt,
  Flower2,
  Dog,
  Brush,
  Home
};

export function ChoreIcon({ name, className = 'w-5 h-5 text-indigo-600' }) {
  const Component = ICON_MAP[name] || CheckSquare;
  return <Component className={className} />;
}

export const AVAILABLE_CHORE_ICONS = [
  { id: 'Sparkles', label: 'Cleaning / Shine' },
  { id: 'Utensils', label: 'Dishes / Kitchen' },
  { id: 'Trash2', label: 'Garbage / Waste' },
  { id: 'ChefHat', label: 'Cooking / Meal Prep' },
  { id: 'ShowerHead', label: 'Bathroom Deep Clean' },
  { id: 'ShoppingCart', label: 'Grocery Shopping' },
  { id: 'Shirt', label: 'Laundry / Folding' },
  { id: 'Flower2', label: 'Balcony & Plants' },
  { id: 'Dog', label: 'Pet Care' },
  { id: 'Brush', label: 'Dusting & Windows' },
  { id: 'Home', label: 'Living Room Reset' }
];
