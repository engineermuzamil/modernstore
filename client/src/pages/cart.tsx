import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, isLoading } = useCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
            <Button onClick={() => setLocation("/login")}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 9.99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Button
          onClick={() => setLocation("/")}
          variant="ghost"
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
      </div>
      
      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <Button onClick={() => setLocation("/")}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {isLoading && cartItems.length === 0 ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center space-x-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-6 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  data-testid={`cart-item-${item.product.id}`}
                  className="p-6 flex items-center space-x-4"
                >
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product.title}</h3>
                    <p className="text-gray-600">${item.product.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      data-testid={`decrease-quantity-${item.product.id}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={isLoading}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span
                      data-testid={`quantity-${item.product.id}`}
                      className="w-8 text-center font-medium"
                    >
                      {item.quantity}
                    </span>
                    <Button
                      data-testid={`increase-quantity-${item.product.id}`}
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={isLoading}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    data-testid={`remove-item-${item.product.id}`}
                    onClick={() => removeFromCart(item.product.id)}
                    disabled={isLoading}
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          {/* Cart Summary */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span data-testid="cart-subtotal" className="text-lg font-semibold">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-600">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-bold">
              <span>Total:</span>
              <span data-testid="cart-total" className="text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              data-testid="checkout-button"
              onClick={() => setLocation("/checkout")}
              disabled={cartItems.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Proceed to Checkout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
