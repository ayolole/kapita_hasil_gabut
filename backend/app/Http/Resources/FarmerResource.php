<?php

namespace App\Http\Resources;

use App\Models\Farmer;
use Illuminate\Http\Request;

/**
 * @mixin Farmer
 */
class FarmerResource extends FarmerSummaryResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'lokasi_lahan' => $this->lokasi_lahan,
            'cerita' => $this->cerita,
            'jumlah_produk' => $this->whenCounted('products'),
        ]);
    }
}
