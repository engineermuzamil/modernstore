import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { useState } from "react";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const { addToCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      return response.json() as Promise<Product>;
    },
    enabled: !!productId,
  });

  const handleAddToCart = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    if (product) {
      // Add multiple quantities to cart
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.id);
      }
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="loading-spinner">
          <div className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600">⏳</div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4" data-testid="error-message">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button 
              data-testid="back-to-products"
              onClick={() => setLocation("/")} 
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        data-testid="back-to-products"
        onClick={() => setLocation("/")}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            data-testid="product-detail-image"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" data-testid="product-detail-title">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-6" data-testid="product-detail-description">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900" data-testid="product-detail-price">${product.price}</span>
          </div>
          
          <div className="mb-6">
            <span 
              data-testid="product-detail-stock"
              className={`inline-block px-3 py-1 rounded-full text-sm ${
                (product.stock || 0) > 0 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}
            >
              {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Category:</h3>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg capitalize" data-testid="product-detail-category">
              {product.category}
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6" data-testid="quantity-selector">
            <h3 className="text-lg font-semibold mb-3">Quantity:</h3>
            <div className="flex items-center space-x-3">
              <Button
                data-testid="quantity-decrease"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
                className="w-10 h-10"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold w-12 text-center" data-testid="quantity-display">{quantity}</span>
              <Button
                data-testid="quantity-increase"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (product.stock || 1)}
                className="w-10 h-10"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              data-testid="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={cartLoading || (product.stock || 0) === 0}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
            >
              {(product.stock || 0) === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Heart className="w-5 h-5 text-gray-600" />
            </Button>
          </div>

          {/* Out of stock message */}
          {(product.stock || 0) === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg" data-testid="out-of-stock-message">
              <p className="text-red-700 text-sm">This product is currently out of stock.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
