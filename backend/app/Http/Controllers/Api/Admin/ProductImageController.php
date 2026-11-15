<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductImageRequest;
use App\Http\Requests\Admin\Product\UpdateProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ActivityLogger;
use App\Services\ImageCompressor;
use Illuminate\Http\JsonResponse;

class ProductImageController extends Controller
{
    public function store(
        StoreProductImageRequest $request,
        Product $product,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        $path = $compressor->store($request->file('foto'), 'products', $product->slug);

        $image = $product->images()->create([
            'path' => $path,
            'alt_text' => $request->validated('alt_text') ?? 'Foto '.$product->nama,
            'urutan' => $request->validated('urutan') ?? ((int) $product->images()->max('urutan') + 1),
        ]);

        $logger->record('tambah', $product, 'Mengunggah foto produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Foto produk berhasil diunggah.',
            'data' => new ProductImageResource($image),
        ], 201);
    }

    public function update(
        UpdateProductImageRequest $request,
        Product $product,
        ProductImage $image,
        ActivityLogger $logger,
    ): JsonResponse {
        $this->ensureImageBelongsToProduct($product, $image);

        $image->update($request->validated());

        $logger->record('ubah', $product, 'Mengubah keterangan foto produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Foto produk berhasil diperbarui.',
            'data' => new ProductImageResource($image),
        ]);
    }

    public function destroy(
        Product $product,
        ProductImage $image,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        $this->ensureImageBelongsToProduct($product, $image);

        $compressor->delete($image->path);
        $image->delete();

        $logger->record('hapus', $product, 'Menghapus foto produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Foto produk berhasil dihapus.',
        ]);
    }

    private function ensureImageBelongsToProduct(Product $product, ProductImage $image): void
    {
        abort_unless($image->product_id === $product->id, 404, 'Foto produk tidak ditemukan.');
    }
}
