<?php

namespace App\Http\Resources\Admin;

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
            'catatan_admin' => $this->catatan_admin,
            'produk' => $this->whenLoaded('product', fn (): ?array => $this->product === null ? null : [
                'id' => $this->product->id,
                'nama' => $this->product->nama,
                'slug' => $this->product->slug,
                'satuan' => $this->product->satuan,
                'dihapus_pada' => $this->product->deleted_at?->toIso8601String(),
            ]),
            'dibuat_pada' => $this->created_at?->toIso8601String(),
            'diperbarui_pada' => $this->updated_at?->toIso8601String(),
        ];
    }
}
