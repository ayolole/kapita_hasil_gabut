<?php

namespace App\Http\Resources\Admin;

use App\Models\Farmer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Farmer
 */
class FarmerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama' => $this->nama,
            'kelompok' => $this->kelompok,
            'foto' => $this->foto ? Storage::disk('public')->url($this->foto) : null,
            'cerita' => $this->cerita,
            'lokasi_lahan' => $this->lokasi_lahan,
            'kontak_internal' => $this->kontak_internal,
            'jumlah_produk' => $this->whenCounted('products'),
            'dibuat_pada' => $this->created_at?->toIso8601String(),
            'diperbarui_pada' => $this->updated_at?->toIso8601String(),
        ];
    }
}
