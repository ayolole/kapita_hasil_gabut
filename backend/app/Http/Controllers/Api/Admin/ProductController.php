<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ProductAvailability;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\IndexProductRequest;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Http\Resources\Admin\ProductDetailResource;
use App\Http\Resources\Admin\ProductResource;
use App\Models\Product;
use App\Services\ActivityLogger;
use App\Services\Slugger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(IndexProductRequest $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->with(['category', 'farmer', 'images'])
            ->withCount('images');

        match ($request->validated('trashed')) {
            'with' => $query->withTrashed(),
            'only' => $query->onlyTrashed(),
            default => null,
        };

        $this->applyFilters($query, $request);
        $this->applySort($query, (string) ($request->validated('sort') ?? 'terbaru'));

        return ProductResource::collection(
            $query->paginate($request->integer('per_page', 15))->withQueryString(),
        );
    }

    public function store(
        StoreProductRequest $request,
        ActivityLogger $logger,
        Slugger $slugger,
    ): JsonResponse {
        $data = $request->validated();
        $data['slug'] = $slugger->unique(Product::class, (string) ($data['slug'] ?? $data['nama']));
        $data['status_ketersediaan'] ??= ProductAvailability::Tersedia;
        $data['stok'] ??= 0;
        $data['aktif'] ??= true;

        $product = Product::query()->create($data);
        $product->load(['category', 'farmer', 'images']);

        $logger->record('tambah', $product, 'Menambahkan produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Produk berhasil ditambahkan.',
            'data' => new ProductDetailResource($product),
        ], 201);
    }

    public function show(Product $product): ProductDetailResource
    {
        $product->load(['category', 'farmer', 'images']);

        return new ProductDetailResource($product);
    }

    public function update(
        UpdateProductRequest $request,
        Product $product,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && blank($data['slug'])) {
            unset($data['slug']);
        }

        $product->fill($data);
        $changes = array_keys($product->getDirty());
        $product->save();

        if ($changes !== []) {
            $logger->record(
                'ubah',
                $product,
                'Mengubah produk '.$product->nama.' ('.implode(', ', $changes).').',
            );
        }

        $product->load(['category', 'farmer', 'images']);

        return response()->json([
            'message' => 'Produk berhasil diperbarui.',
            'data' => new ProductDetailResource($product),
        ]);
    }

    public function destroy(Product $product, ActivityLogger $logger): JsonResponse
    {
        $product->delete();

        $logger->record('hapus', $product, 'Menghapus produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    public function restore(int $product, ActivityLogger $logger): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($product);
        $product->restore();
        $product->load(['category', 'farmer', 'images']);

        $logger->record('ubah', $product, 'Memulihkan produk '.$product->nama.'.');

        return response()->json([
            'message' => 'Produk berhasil dipulihkan.',
            'data' => new ProductDetailResource($product),
        ]);
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applyFilters(Builder $query, IndexProductRequest $request): void
    {
        if ($search = $request->validated('search')) {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($category = $request->validated('category')) {
            $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
        }

        if ($status = $request->validated('status')) {
            $query->where('status_ketersediaan', $status);
        }

        if ($request->has('aktif') && $request->validated('aktif') !== null) {
            $query->where('aktif', $request->boolean('aktif'));
        }
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applySort(Builder $query, string $sort): void
    {
        match ($sort) {
            'nama' => $query->orderBy('nama')->orderBy('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };
    }
}
