<?php

namespace App\Http\Resources\Admin;

use App\Models\Farmer;
use Illuminate\Http\Request;

/**
 * @mixin Farmer
 */
class FarmerDetailResource extends FarmerResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'produk' => $this->whenLoaded(
                'products',
                fn () => ProductResource::collection($this->products),
            ),
        ]);
    }
}
