<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        $this->syncToVectorService($product);
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        $this->syncToVectorService($product);
    }

    /**
     * Send product payload to Golang AI Service for vector embedding.
     */
    protected function syncToVectorService(Product $product): void
    {
        $golangUrl = rtrim(config('services.golang_ai.url', 'http://localhost:8080'), '/');

        try {
            $payload = [
                'id' => $product->id,
                'category' => $product->category?->name ?? 'General',
                'name' => $product->name,
                'description' => $product->description,
                'price' => (float) $product->price,
            ];

            // Asynchronous / short timeout HTTP post to avoid blocking request cycle
            Http::timeout(3)
                ->connectTimeout(2)
                ->post("{$golangUrl}/api/vectorize", $payload);

            Log::info("Product #{$product->id} sent to Golang AI Service for vectorization.");
        } catch (\Throwable $e) {
            Log::warning("Could not sync product #{$product->id} to Golang AI Service: {$e->getMessage()}");
        }
    }
}

