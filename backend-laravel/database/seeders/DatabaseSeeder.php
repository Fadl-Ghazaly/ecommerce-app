<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('1. Membuat akun Admin & Customer...');

        // 1. Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@shophub.com'],
            [
                'name' => 'Admin ShopHub',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // 2. Customer User
        $customer = User::firstOrCreate(
            ['email' => 'customer@shophub.com'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );

        // 3. Jalankan ProductSeeder (120 Produk dari 6 Kategori)
        $this->call(ProductSeeder::class);

        // 4. Buat beberapa ulasan sampel awal
        $this->command->info('2. Menambahkan ulasan awal untuk produk unggulan...');
        $sampleProducts = Product::take(5)->get();
        $sampleComments = [
            'Produk sangat memuaskan, kualitas materialnya juara dan sesuai deskripsi!',
            'Pengiriman kilat dan packing sangat aman berlapis bubble wrap. Recommended!',
            'Fitur AI ShopHub merekomendasikan produk ini dengan sangat akurat. Mantap!',
            'Harga sangat terjangkau dibanding toko lain dengan kualitas yang sama premium.',
            'Bintang lima tanpa ragu, pasti akan repeat order lagi di ShopHub!'
        ];

        foreach ($sampleProducts as $idx => $prod) {
            Review::firstOrCreate(
                ['user_id' => $customer->id, 'product_id' => $prod->id],
                [
                    'rating' => 5,
                    'comment' => $sampleComments[$idx % count($sampleComments)],
                ]
            );
        }

        $this->command->info('✅ Seluruh proses seeding Database ShopHub berhasil diselesaikan!');
    }
}
