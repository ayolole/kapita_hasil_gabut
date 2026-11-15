<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farmers', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('kelompok')->nullable();
            $table->string('foto')->nullable();
            $table->text('cerita')->nullable();
            $table->string('lokasi_lahan')->nullable();
            $table->string('kontak_internal')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farmers');
    }
};
