<?php

namespace App\Http\Resources;

use App\Models\Lead;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Lead
 */
class LeadResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode_ref' => $this->kode_ref,
            'jumlah' => (float) $this->jumlah,
            'nama_pembeli' => $this->nama_pembeli,
            'kebutuhan' => $this->kebutuhan,
            'catatan' => $this->catatan,
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
            ],
            'produk' => $this->whenLoaded('product', fn (): array => [
                'nama' => $this->product->nama,
                'slug' => $this->product->slug,
                'satuan' => $this->product->satuan,
            ]),
            'dibuat_pada' => $this->created_at?->toIso8601String(),
        ];
    }
}
