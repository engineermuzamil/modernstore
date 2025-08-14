import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

interface HomeProps {
  searchTerm?: string;
}

export default function Home({ searchTerm = "" }: HomeProps) {
  const [category, setCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState("");

  // Use the search term from navbar if provided
  const activeSearchTerm = searchTerm || localSearch;

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/api/products", category, activeSearchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.append("category", category);
      if (activeSearchTerm) params.append("search", activeSearchTerm);
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json() as Promise<Product[]>;
    },
  });

  const handleSearchChange = (term: string) => {
    setLocalSearch(term);
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="loading-spinner">
          <RefreshCw className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12" data-testid="error-message">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load products</h2>
          <p className="text-gray-600 mb-4">Something went wrong while fetching products.</p>
          <Button 
            data-testid="retry-button"
            onClick={() => refetch()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="mb-12">
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl overflow-hidden h-96 flex items-center">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 text-white px-8 md:px-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Discover Amazing Products</h2>
            <p className="text-xl mb-8 opacity-90">Find everything you need in our curated collection</p>
            <Button
              data-testid="hero-cta"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <ProductFilters
        category={category}
        onCategoryChange={setCategory}
        searchTerm={activeSearchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Products Grid */}
      <section id="products" className="mb-12">
        {products.length === 0 ? (
          <div className="text-center py-12" data-testid="no-results-message">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
