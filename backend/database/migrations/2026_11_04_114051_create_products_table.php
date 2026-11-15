<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->foreignId('farmer_id')->constrained()->restrictOnDelete();
            $table->text('deskripsi')->nullable();
            $table->text('spesifikasi')->nullable();
            $table->string('satuan', 30);
            $table->decimal('harga', 12, 2);
            $table->enum('status_ketersediaan', ['tersedia', 'terbatas', 'habis', 'akan_panen'])
                ->default('tersedia');
            $table->decimal('stok', 10, 2)->default(0);
            $table->date('estimasi_panen')->nullable();
            $table->boolean('aktif')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['aktif', 'status_ketersediaan'], 'products_public_filter_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
