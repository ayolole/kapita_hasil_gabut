<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->dropIndex(['sumber']);
            $table->dropColumn('sumber');
        });
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $table) {
            $table->enum('sumber', ['langsung', 'qr'])->default('langsung')->after('path');
            $table->index('sumber');
        });
    }
};
