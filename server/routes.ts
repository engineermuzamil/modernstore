import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertProductSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Admin middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed data
  await seedDatabase();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.status(201).json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await storage.getProducts(
        category as string,
        search as string
      );
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireAdmin, async (req: any, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from accessing cart
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot access cart. Please use a regular customer account."
        });
      }

      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from adding to cart
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot add items to cart. Please use a regular customer account."
        });
      }

      const { productId, quantity = 1 } = req.body;

      // Check product stock
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check existing cart item
      const existingCartItems = await storage.getCartItems(req.user.id);
      const existingItem = existingCartItems.find(item => item.productId === productId);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Check if there's enough stock
      if ((product.stock || 0) < newQuantity) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock || 0}, Requested: ${newQuantity}`
        });
      }

      let cartItem;
      if (existingItem) {
        // Update existing item
        cartItem = await storage.updateCartItem(req.user.id, productId, newQuantity);
      } else {
        // Add new item
        cartItem = await storage.addToCart({
          userId: req.user.id,
          productId,
          quantity,
        });
      }

      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:productId", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from updating cart
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot update cart. Please use a regular customer account."
        });
      }

      const { quantity } = req.body;

      // Check product stock
      const product = await storage.getProduct(req.params.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if there's enough stock
      if ((product.stock || 0) < quantity) {
        return res.status(400).json({
          message: `Insufficient stock. Available: ${product.stock || 0}, Requested: ${quantity}`
        });
      }

      const cartItem = await storage.updateCartItem(req.user.id, req.params.productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(400).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/:productId", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from removing from cart
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot remove items from cart. Please use a regular customer account."
        });
      }

      const success = await storage.removeFromCart(req.user.id, req.params.productId);
      if (!success) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.post("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from placing orders
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot place orders. Please use a regular customer account."
        });
      }

      // Get cart items first
      const cartItems = await storage.getCartItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      // Check stock availability for all items
      for (const item of cartItems) {
        const currentStock = item.product.stock ?? 0;
        if (currentStock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${item.product.title}. Available: ${currentStock}, Requested: ${item.quantity}`
          });
        }
      }

      // Calculate total
      const total = cartItems.reduce((sum, item) =>
        sum + (parseFloat(item.product.price) * item.quantity), 0
      );

      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.user.id,
        total: total.toString(),
      });

      // Create order and update stock
      const order = await storage.createOrder(
        orderData,
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price.toString(),
        }))
      );

      // Update product stock for each item
      for (const item of cartItems) {
        await storage.updateProductStock(item.productId, item.quantity);
      }

      // Clear cart
      await storage.clearCart(req.user.id);

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      console.error("Request body:", req.body);
      console.error("User ID:", req.user.id);
      res.status(400).json({
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    try {
      // Prevent admin users from accessing orders
      if (req.user.isAdmin) {
        return res.status(403).json({
          message: "Admin users cannot access orders. Please use a regular customer account."
        });
      }

      const orders = await storage.getUserOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function seedDatabase() {
  try {
    // Check if products already exist
    const existingProducts = await storage.getProducts();
    if (existingProducts.length > 0) {
      return; // Already seeded
    }

    // Create admin user
    const adminExists = await storage.getUserByEmail("admin@modernstore.com");
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        email: "admin@modernstore.com",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        isAdmin: true,
      });
    }

    // Seed products
    const products = [
      {
        title: "Premium Wireless Headphones",
        description: "High-quality audio with noise cancellation",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "electronics" as const,
        stock: 45,
      },
      {
        title: "Classic Denim Jacket",
        description: "Timeless style for any occasion",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "clothing" as const,
        stock: 23,
      },
      {
        title: "Smart Coffee Maker",
        description: "Programmable brewing with app control",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "home" as const,
        stock: 15,
      },
      {
        title: "JavaScript Guide",
        description: "Complete guide to modern JavaScript",
        price: "49.99",
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "books" as const,
        stock: 30,
      },
      {
        title: "Premium Yoga Mat Set",
        description: "Eco-friendly with carrying strap",
        price: "79.99",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "sports" as const,
        stock: 20,
      },
      {
        title: "Latest Smartphone",
        description: "5G enabled with amazing camera",
        price: "899.99",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "electronics" as const,
        stock: 12,
      },
      {
        title: "Designer Table Lamp",
        description: "Minimalist design with warm light",
        price: "129.99",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "home" as const,
        stock: 8,
      },
      {
        title: "Performance Running Shoes",
        description: "Lightweight with superior cushioning",
        price: "159.99",
        imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
        category: "clothing" as const,
        stock: 35,
      },
    ];

    for (const product of products) {
      await storage.createProduct(product);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
