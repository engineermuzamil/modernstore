import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleAddToCart = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    await addToCart(product.id);
  };

  const handleCardClick = () => {
    setLocation(`/product/${product.id}`);
  };

  return (
    <Card
      data-testid="product-card"
      data-category={product.category}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          data-testid="product-image"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1" data-testid="product-title">{product.title}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        
        {/* Stock indicator */}
        <div className="mb-2">
          <span 
            data-testid="product-stock"
            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              (product.stock || 0) > 5 
                ? "bg-green-100 text-green-800" 
                : (product.stock || 0) > 0 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-red-100 text-red-800"
            }`}
          >
            {(product.stock || 0) > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900" data-testid="product-price">${product.price}</span>
          <span className="text-sm text-gray-600 capitalize" data-testid="product-category">{product.category}</span>
        </div>
        
        <div className="mt-3">
          <Button
            data-testid="add-to-cart-button"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isLoading || (product.stock || 0) === 0}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {(product.stock || 0) === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
