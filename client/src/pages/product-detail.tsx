import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, ArrowLeft, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

export default function ProductDetail() {
  const params = useParams();
  const productId = params.id;
  const { addToCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

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
      await addToCart(product.id);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
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
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
          <p className="text-gray-600 text-lg mb-6">{product.description}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">${product.price}</span>
          </div>
          
          <div className="mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
              (product.stock || 0) > 0 
                ? "bg-green-100 text-green-800" 
                : "bg-red-100 text-red-800"
            }`}>
              {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Category:</h3>
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg capitalize">
              {product.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              data-testid="detail-add-to-cart"
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
        </div>
      </div>
    </div>
  );
}
