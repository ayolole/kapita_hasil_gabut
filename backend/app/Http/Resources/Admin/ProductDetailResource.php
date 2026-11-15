<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * @mixin Product
 */
class ProductDetailResource extends ProductResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'deskripsi' => $this->deskripsi,
            'spesifikasi' => $this->spesifikasi,
            'gambar' => $this->whenLoaded(
                'images',
                fn () => ProductImageResource::collection($this->images),
            ),
        ]);
    }
}
