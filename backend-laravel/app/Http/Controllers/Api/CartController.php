<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get current user's cart and items.
     */
    public function index(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $cart->load(['items.product.category']);

        $totalPrice = $cart->items->sum(function ($item) {
            return ($item->product->price ?? 0) * $item->quantity;
        });

        $totalItems = $cart->items->sum('quantity');

        return response()->json([
            'cart_id' => $cart->id,
            'items' => $cart->items,
            'total_items' => $totalItems,
            'total_price' => (float) $totalPrice,
        ]);
    }

    /**
     * Add item to cart or increment quantity if already present.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $quantity = $validated['quantity'] ?? 1;
        $product = Product::findOrFail($validated['product_id']);

        if ($product->stock < $quantity) {
            return response()->json([
                'message' => "Insufficient stock. Only {$product->stock} available.",
            ], 422);
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->first();

        if ($item) {
            $newQuantity = $item->quantity + $quantity;
            if ($product->stock < $newQuantity) {
                return response()->json([
                    'message' => "Cannot add more. You have {$item->quantity} in cart and stock is {$product->stock}.",
                ], 422);
            }
            $item->update(['quantity' => $newQuantity]);
        } else {
            $item = CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'message' => 'Product added to cart',
            'item' => $item->load('product'),
        ], 201);
    }

    /**
     * Update quantity of a specific cart item.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $item = CartItem::where('cart_id', $cart->id)->where('id', $id)->firstOrFail();

        $product = $item->product;
        if ($product->stock < $validated['quantity']) {
            return response()->json([
                'message' => "Insufficient stock. Only {$product->stock} available.",
            ], 422);
        }

        $item->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Cart updated successfully',
            'item' => $item->load('product'),
        ]);
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->firstOrFail();
        $item = CartItem::where('cart_id', $cart->id)->where('id', $id)->firstOrFail();

        $item->delete();

        return response()->json([
            'message' => 'Item removed from cart',
        ]);
    }

    /**
     * Clear all items from the cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)->first();
        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'message' => 'Cart cleared successfully',
        ]);
    }
}

