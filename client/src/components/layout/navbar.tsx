import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, User, LogOut, Package } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NavbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function Navbar({ searchTerm, onSearchChange }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">ModernStore</h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Link href="/" className={location === "/" ? "text-gray-900 hover:text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>
                  Home
                </Link>
                {!user?.isAdmin && (
                  <Link href="/orders" className={location === "/orders" ? "text-gray-900 hover:text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>
                    Orders
                  </Link>
                )}
                {user?.isAdmin && (
                  <Link href="/admin" className={location === "/admin" ? "text-gray-900 hover:text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}>
                    Admin
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar - Only show on home page */}
            {location === "/" && (
              <div className="hidden sm:block relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  data-testid="search-input"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            )}

            {user ? (
              <>
                {/* Orders Icon - Only show for non-admin users */}
                {!user.isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="orders-button"
                    onClick={() => setLocation("/orders")}
                    className="p-2 text-gray-600 hover:text-blue-600"
                  >
                    <Package className="w-5 h-5" />
                  </Button>
                )}

                {/* Cart Icon - Only show for non-admin users */}
                {!user.isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="cart-button"
                    onClick={() => setLocation("/cart")}
                    className="relative p-2 text-gray-600 hover:text-blue-600"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                )}

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Hello, {user.firstName || user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="logout-button"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  data-testid="login-button"
                  onClick={() => setLocation("/login")}
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Login
                </Button>
                <span className="text-gray-400">|</span>
                <Button
                  data-testid="register-button"
                  onClick={() => setLocation("/login?mode=register")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
