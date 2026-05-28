import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      _id: { $in: req.user.cartItems.map((item) => item.id) },
    });

    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id.toString() === product._id.toString()
      );

      return {
        ...product.toJSON(),
        quantity: item ? item.quantity : 1, // ✅ safe fallback
      };
    });

    res.json(cartItems);
  } catch (error) {
    console.error("Error in getCartProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({ id: productId, quantity: 1 }); // ✅ store as object
    }

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeAllFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;
		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.id !== productId);
		}
		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
  try {
    const { id } = req.params; // product id
    const { quantity } = req.body;
    const user = req.user;

    const item = user.cartItems.find((i) => i.id.toString() === id);

    if (item) {
      if (quantity <= 0) {
        user.cartItems = user.cartItems.filter((i) => i.id.toString() !== id);
      } else {
        item.quantity = quantity;
      }
      await user.save();

      // return updated cart with product details
      const products = await Product.find({
        _id: { $in: user.cartItems.map((i) => i.id) },
      });

      const cartItems = products.map((p) => {
        const cartItem = user.cartItems.find(
          (i) => i.id.toString() === p._id.toString()
        );
        return { ...p.toJSON(), quantity: cartItem.quantity };
      });

      return res.json(cartItems);
    }

    res.status(404).json({ message: "Product not found in cart" });
  } catch (err) {
    console.error("updateQuantity error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};