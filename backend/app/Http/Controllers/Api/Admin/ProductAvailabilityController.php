<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ProductAvailability;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\UpdateAvailabilityRequest;
use App\Http\Resources\Admin\ProductDetailResource;
use App\Models\Product;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;

class ProductAvailabilityController extends Controller
{
    public function update(
        UpdateAvailabilityRequest $request,
        Product $product,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();

        if ($data['status_ketersediaan'] === ProductAvailability::Habis->value
            && ! array_key_exists('stok', $data)) {
            $data['stok'] = 0;
        }

        $product->update($data);
        $product->load(['category', 'farmer', 'images']);

        $logger->record('ubah', $product, 'Mengubah ketersediaan '.$product->nama.' menjadi '
            .$product->status_ketersediaan->label().'.');

        return response()->json([
            'message' => 'Ketersediaan produk berhasil diperbarui.',
            'data' => new ProductDetailResource($product),
        ]);
    }
}
