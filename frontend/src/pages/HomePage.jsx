import { useEffect, useState } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import { useCartStore } from "../stores/useCartStore";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const HomePage = () => {
  // ✅ use selectors for featuredProducts
  const fetchFeaturedProducts = useProductStore((state) => state.fetchFeaturedProducts);
  const featuredProducts = useProductStore((state) => state.featuredProducts);
  const isLoading = useProductStore((state) => state.loading);

  const { addToCart } = useCartStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const nextProducts = () => {
    if (featuredProducts && currentIndex + 4 < featuredProducts.length) {
      setCurrentIndex(currentIndex + 4);
    }
  };

  const prevProducts = () => {
    if (featuredProducts && currentIndex - 4 >= 0) {
      setCurrentIndex(currentIndex - 4);
    }
  };

  const visibleProducts = featuredProducts ? featuredProducts.slice(currentIndex, currentIndex + 4) : [];

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Hero Heading */}
        <h1 className="text-center text-5xl sm:text-6xl font-extrabold text-gray-900 mb-4">
          Explore Our Categories
        </h1>
        <p className="text-center text-xl text-gray-600 mb-12">
          Discover the latest trends in eco‑friendly fashion
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {/* Featured Products */}
        {!isLoading && visibleProducts.length > 0 && (
          <section className="mt-16 bg-gray-100 py-12 relative">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Featured Products
              </h2>

              {/* Product Carousel */}
              <div className="relative flex items-center">
                {/* Left Arrow */}
                <button
                  onClick={prevProducts}
                  disabled={currentIndex === 0}
                  className={`absolute -left-4 z-20 p-2 rounded-full shadow transition ${
                    currentIndex === 0
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Product Grid (4 at a time) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
                  {visibleProducts.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-xl border border-gray-400 shadow-sm overflow-hidden hover:shadow-md transition"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-gray-600">
                          ₱{product.price.toFixed(2)}
                        </p>
                        <button
                          onClick={() => {
                            addToCart(product);
                            toast.success(`${product.name} added to cart`, { id: "add-to-cart" });
                          }}
                          className="mt-4 w-full flex items-center justify-center bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                          <ShoppingCart size={20} className="mr-2" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Arrow */}
                <button
                  onClick={nextProducts}
                  disabled={currentIndex + 4 >= featuredProducts.length}
                  className={`absolute -right-4 z-20 p-2 rounded-full shadow transition ${
                    currentIndex + 4 >= featuredProducts.length
                      ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                      : "bg-gray-800 text-white hover:bg-gray-700"
                  }`}
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default HomePage;
