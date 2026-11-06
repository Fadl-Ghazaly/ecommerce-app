<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SyncVectorsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shophub:sync-vectors';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kirim seluruh katalog produk ke Golang AI Service untuk kalkulasi vektor & embedding';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $golangUrl = rtrim(config('services.golang_ai.url', 'http://localhost:8080'), '/');
        $this->info("Menghubungkan ke Golang AI Service di: {$golangUrl} ...");

        // Cek konektivitas ke Golang AI
        try {
            $health = Http::timeout(3)->get("{$golangUrl}/health");
            if ($health->successful()) {
                $this->info("✓ Golang AI Service terdeteksi ONLINE.");
            }
        } catch (\Throwable $e) {
            $this->warn("! Peringatan: Golang AI Service belum merespon. Pastikan 'go run main.go' aktif di port 8080.");
        }

        $products = Product::with('category')->get();
        $total = $products->count();

        if ($total === 0) {
            $this->warn("Tidak ada produk di database. Jalankan 'php artisan db:seed' terlebih dahulu.");
            return 0;
        }

        $this->info("Mengirim {$total} produk ke endpoint {$golangUrl}/api/vectorize ...");
        $bar = $this->output->createProgressBar($total);
        $bar->start();

        $successCount = 0;
        foreach ($products as $product) {
            try {
                $response = Http::timeout(2)->post("{$golangUrl}/api/vectorize", [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category?->name ?? 'Umum',
                    'description' => $product->description,
                    'price' => (float) $product->price,
                ]);

                if ($response->successful()) {
                    $successCount++;
                }
            } catch (\Throwable $e) {
                // Lewati jika error timeout
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✓ Selesai! Sebanyak {$successCount} dari {$total} produk berhasil disinkronkan ke Vector Store AI.");

        return 0;
    }
}

