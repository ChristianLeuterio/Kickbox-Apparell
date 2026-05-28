import { useEffect } from "react";
import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { Link } from "react-router-dom";
import Confetti from "react-confetti";
import { useCartStore } from "../stores/useCartStore";
import { toast } from "react-hot-toast";

const PurchaseSuccessPage = () => {
  const { clearCart } = useCartStore();

  useEffect(() => {
    clearCart(); // ✅ clears cart, coupon, totals
    toast.success("Cart cleared after purchase"); // optional feedback
  }, [clearCart]);

  return (
    <div className="relative h-screen flex items-center justify-center bg-gray-900 px-4">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        gravity={0.08}
        style={{ zIndex: 50 }}
        numberOfPieces={500}
        recycle={false}
      />

      <div className="max-w-lg w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden relative z-10 border border-emerald-500/30">
        <div className="p-8">
          <div className="flex justify-center">
            <CheckCircle className="text-white w-20 h-20 mb-6" />
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-4">
            Payment Successful!
          </h1>

          <p className="text-gray-200 text-center mb-2">
            Thank you for your order. We’re preparing it for delivery.
          </p>
          <p className="text-white text-center text-sm mb-8">
            A confirmation email has been sent to you.
          </p>

          <div className="bg-gray-700 rounded-lg p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300">Order Number</span>
              <span className="text-sm font-semibold text-white">#12345</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Estimated Delivery</span>
              <span className="text-sm font-semibold text-white">3–5 business days</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center shadow-lg"
            >
              <HandHeart className="mr-2" size={20} />
              Thanks for trusting us!
            </button>
            <Link
              to="/"
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center shadow-lg"
            >
              Continue Shopping
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;