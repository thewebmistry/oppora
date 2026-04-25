'use client';

import { Product } from '@/types/product';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format price with Indian Rupee symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Get category display name
  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      StarterKit: 'Starter Kit',
      Software: 'Software',
      PhysicalGoods: 'Physical Goods',
      Subscription: 'Subscription',
      Other: 'Other',
    };
    return categoryMap[category] || category;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'out_of_stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'discontinued':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card
      padding="md"
      shadow
      hoverEffect
      border
      className="h-full flex flex-col transition-all duration-300 hover:shadow-xl"
    >
      {/* Product Image */}
      <div className="mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 aspect-square">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl text-gray-400 dark:text-gray-600">
              {product.productName.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {product.productName}
          </h3>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
            {product.status === 'active' ? 'Available' : product.status.replace('_', ' ')}
          </span>
        </div>

        {/* Category Tag */}
        <div className="mb-3">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
            {getCategoryDisplay(product.category)}
          </span>
        </div>

        {/* Description (truncated) */}
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </p>
              {product.price === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Free</p>
              )}
            </div>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}