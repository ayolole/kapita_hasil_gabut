<?php

namespace App\Http\Resources\Admin;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'slug' => $this->slug,
            'satuan' => $this->satuan,
            'status_ketersediaan' => [
                'value' => $this->status_ketersediaan->value,
                'label' => $this->status_ketersediaan->label(),
            ],
            'stok' => (float) $this->stok,
            'estimasi_panen' => $this->estimasi_panen?->toDateString(),
            'aktif' => (bool) $this->aktif,
            'gambar_utama' => $this->whenLoaded('images', function (): ?string {
                $image = $this->images->first();

                return $image ? Storage::disk('public')->url($image->path) : null;
            }),
            'jumlah_gambar' => $this->whenCounted('images'),
            'kategori' => $this->whenLoaded(
                'category',
                fn (): CategoryResource => new CategoryResource($this->category),
            ),
            'petani' => $this->whenLoaded(
                'farmer',
                fn (): FarmerResource => new FarmerResource($this->farmer),
            ),
            'dibuat_pada' => $this->created_at?->toIso8601String(),
            'diperbarui_pada' => $this->updated_at?->toIso8601String(),
            'dihapus_pada' => $this->deleted_at?->toIso8601String(),
        ];
    }
}
