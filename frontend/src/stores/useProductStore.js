import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios";

export const useProductStore = create((set) => ({
  products: [],
  loading: false,

  setProducts: (products) => set({ products }),

  // Create product
  createProduct: async (productData) => {
    set({ loading: true });
    try {
      const res = await axios.post("/products", productData);
      set((prevState) => ({
        products: [...prevState.products, res.data],
        loading: false,
      }));
      toast.success("Product created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create product");
      set({ loading: false });
    }
  },

  // ✅ Fetch all products
  fetchAllProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get("/products");
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  // ✅ Fetch featured products (homepage)
  fetchFeaturedProducts: async () => {
    set({ loading: true });
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/featured`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch featured products");
    }
  },

  // Fetch products by category
  fetchProductsByCategory: async (category) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/category/${category}`);
      set({ products: response.data.products, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  // Delete product
  deleteProduct: async (productId) => {
    set({ loading: true });
    try {
      await axios.delete(`/products/${productId}`);
      set((prevState) => ({
        products: prevState.products.filter((p) => p._id !== productId),
        loading: false,
      }));
      toast.success("Product deleted successfully!");
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.error || "Failed to delete product");
    }
  },

  // Toggle featured product
  toggleFeaturedProduct: async (productId) => {
  set({ loading: true });
  try {
    const response = await axios.patch(`/products/${productId}/toggle-feature`);
    set((prevState) => ({
      products: prevState.products.map((p) =>
        p._id === productId ? { ...p, isFeatured: response.data.isFeatured } : p
      ),
      loading: false,
    }));
    toast.success("Product featured status updated!");
  } catch (error) {
    set({ loading: false });
    toast.error(error.response?.data?.message || "Failed to update product");
  }
},

}));
