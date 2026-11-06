<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Snap;

class OrderController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$isProduction = (bool) config('midtrans.is_production', false);
        Config::$isSanitized = (bool) config('midtrans.is_sanitized', true);
        Config::$is3ds = (bool) config('midtrans.is_3ds', true);
    }

    /**
     * Get list of orders for authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    /**
     * Get order details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'order' => $order,
            'client_key' => config('midtrans.client_key'),
        ]);
    }

    /**
     * Checkout current cart and generate Midtrans Snap Token.
     */
    public function checkout(Request $request): JsonResponse
    {
        $user = $request->user();
        $cart = Cart::with(['items.product'])->where('user_id', $user->id)->first();

        if (! $cart || $cart->items->isEmpty()) {
            return response()->json([
                'message' => 'Your cart is empty. Please add items before checking out.',
            ], 422);
        }

        // Validate stock availability
        foreach ($cart->items as $cartItem) {
            if ($cartItem->product->stock < $cartItem->quantity) {
                return response()->json([
                    'message' => "Product '{$cartItem->product->name}' does not have enough stock.",
                ], 422);
            }
        }

        $totalPrice = 0;
        $orderItemsData = [];
        $midtransItemDetails = [];

        foreach ($cart->items as $item) {
            $itemTotal = $item->product->price * $item->quantity;
            $totalPrice += $itemTotal;

            $orderItemsData[] = [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $item->product->price,
            ];

            $midtransItemDetails[] = [
                'id' => (string) $item->product_id,
                'price' => (int) round($item->product->price),
                'quantity' => $item->quantity,
                'name' => mb_substr($item->product->name, 0, 50),
            ];
        }

        $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(Str::random(6));

        DB::beginTransaction();
        try {
            // 1. Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'total_price' => $totalPrice,
                'payment_status' => 'pending',
            ]);

            // 2. Create order items & deduct product stock
            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);

                Product::where('id', $itemData['product_id'])
                    ->decrement('stock', $itemData['quantity']);
            }

            // 3. Prepare Midtrans Snap parameters
            $params = [
                'transaction_details' => [
                    'order_id' => $order->order_number,
                    'gross_amount' => (int) round($totalPrice),
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                ],
                'item_details' => $midtransItemDetails,
            ];

            // 4. Generate Snap Token
            $snapToken = null;
            try {
                $snapToken = Snap::getSnapToken($params);
                $order->update(['snap_token' => $snapToken]);
            } catch (\Throwable $midtransErr) {
                Log::warning("Midtrans Snap generation warning: {$midtransErr->getMessage()}");
                // For development without active key, create mock token if failed
                $snapToken = 'DEV-SNAP-' . Str::random(24);
                $order->update(['snap_token' => $snapToken]);
            }

            // 5. Empty user cart
            $cart->items()->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load('items.product'),
                'snap_token' => $order->snap_token,
                'client_key' => config('midtrans.client_key'),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Order checkout failed: {$e->getMessage()}");

            return response()->json([
                'message' => 'Failed to process checkout: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Midtrans Payment Notification Webhook.
     */
    public function midtransCallback(Request $request): JsonResponse
    {
        try {
            $notification = new Notification();
        } catch (\Throwable $e) {
            // Fallback to manual payload parsing
            $payload = $request->all();
            $notification = (object) $payload;
        }

        $orderId = $notification->order_id ?? $request->input('order_id');
        $statusCode = $notification->status_code ?? $request->input('status_code');
        $grossAmount = $notification->gross_amount ?? $request->input('gross_amount');
        $signatureKey = $notification->signature_key ?? $request->input('signature_key');
        $transactionStatus = $notification->transaction_status ?? $request->input('transaction_status');
        $fraudStatus = $notification->fraud_status ?? $request->input('fraud_status');

        // Verify SHA512 signature if server key is configured
        $serverKey = config('midtrans.server_key');
        if (! empty($serverKey) && ! str_contains($serverKey, 'YOUR_SERVER_KEY')) {
            $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);
            if ($signatureKey !== $expectedSignature) {
                return response()->json(['message' => 'Invalid signature key'], 403);
            }
        }

        $order = Order::with('items')->where('order_number', $orderId)->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $newStatus = 'pending';

        if ($transactionStatus == 'capture') {
            $newStatus = ($fraudStatus == 'challenge') ? 'challenge' : 'paid';
        } elseif ($transactionStatus == 'settlement') {
            $newStatus = 'paid';
        } elseif (in_array($transactionStatus, ['cancel', 'deny'])) {
            $newStatus = 'canceled';
        } elseif ($transactionStatus == 'expire') {
            $newStatus = 'expired';
        }

        // If order was canceled or expired and was not previously paid, restore stock
        if (in_array($newStatus, ['canceled', 'expired']) && $order->payment_status !== 'paid') {
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }

        $order->update(['payment_status' => $newStatus]);

        return response()->json([
            'message' => 'Payment notification processed successfully',
            'order_status' => $newStatus,
        ]);
    }

    /**
     * Admin: Get all customer orders with customer details.
     */
    public function adminOrders(Request $request): JsonResponse
    {
        $orders = Order::with(['user', 'items.product'])
            ->latest()
            ->paginate(20);

        return response()->json($orders);
    }

    /**
     * Admin: Update order payment status manually.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'payment_status' => 'required|string|in:pending,paid,challenge,canceled,expired',
        ]);

        $order = Order::with('items')->findOrFail($id);
        $oldStatus = $order->payment_status;
        $newStatus = $validated['payment_status'];

        // If newly canceled/expired, restore stock
        if (in_array($newStatus, ['canceled', 'expired']) && $oldStatus !== 'paid') {
            foreach ($order->items as $item) {
                Product::where('id', $item->product_id)->increment('stock', $item->quantity);
            }
        }

        $order->update(['payment_status' => $newStatus]);

        return response()->json([
            'message' => "Order #{$order->order_number} status updated to {$newStatus}",
            'order' => $order,
        ]);
    }
}

