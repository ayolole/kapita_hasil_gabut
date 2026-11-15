<?php

namespace App\Http\Controllers\Api;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lead\StoreLeadRequest;
use App\Http\Resources\LeadResource;
use App\Models\Lead;
use App\Models\Product;
use App\Services\LeadMessageBuilder;
use Illuminate\Http\JsonResponse;

class LeadController extends Controller
{
    public function store(StoreLeadRequest $request): JsonResponse
    {
        $product = Product::query()
            ->where('slug', $request->validated('product_slug'))
            ->firstOrFail();

        $lead = Lead::query()->create([
            'product_id' => $product->id,
            'jumlah' => $request->validated('jumlah') ?? 1,
            'nama_pembeli' => $request->validated('nama_pembeli'),
            'kebutuhan' => $request->validated('kebutuhan'),
            'catatan' => $request->validated('catatan'),
            'status' => LeadStatus::Baru,
        ]);

        $lead->setRelation('product', $product);

        return response()->json([
            'message' => 'Permintaan informasi berhasil dibuat.',
            'data' => new LeadResource($lead),
            'whatsapp' => LeadMessageBuilder::make()->build($lead),
        ], 201);
    }
}
