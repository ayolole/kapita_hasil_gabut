<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FarmerDetailResource;
use App\Http\Resources\FarmerResource;
use App\Models\Farmer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FarmerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $farmers = Farmer::query()
            ->withCount([
                'products' => fn (Builder $query) => $query->where('aktif', true),
            ])
            ->orderBy('nama')
            ->get();

        return FarmerResource::collection($farmers);
    }

    public function show(Farmer $farmer): FarmerDetailResource
    {
        $farmer->loadCount([
            'products' => fn (Builder $query) => $query->where('aktif', true),
        ]);

        $farmer->load([
            'products' => fn (HasMany $query) => $query
                ->where('aktif', true)
                ->with(['category', 'images'])
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ]);

        return new FarmerDetailResource($farmer);
    }
}
