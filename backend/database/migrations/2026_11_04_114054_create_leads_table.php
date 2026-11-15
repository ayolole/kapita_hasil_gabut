<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('kode_ref', 20)->unique();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->decimal('jumlah', 10, 2);
            $table->string('nama_pembeli');
            $table->text('catatan')->nullable();
            $table->enum('status', ['baru', 'dihubungi', 'selesai', 'batal'])->default('baru');
            $table->text('catatan_admin')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
