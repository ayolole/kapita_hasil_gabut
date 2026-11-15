<?php

namespace App\Models;

use Database\Factories\FarmerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['nama', 'kelompok', 'foto', 'cerita', 'lokasi_lahan', 'kontak_internal'])]
#[Hidden(['kontak_internal'])]
class Farmer extends Model
{
    /** @use HasFactory<FarmerFactory> */
    use HasFactory;

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
