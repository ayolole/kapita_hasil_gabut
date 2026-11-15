<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\IndexProductRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function index(IndexProductRequest $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with(['category', 'farmer', 'images'])
            ->where('aktif', true);

        $this->applyFilters($products, $request);
        $this->applySort($products, (string) ($request->validated('sort') ?? 'terbaru'));

        return ProductResource::collection(
            $products->paginate($request->integer('per_page', 12))->withQueryString(),
        );
    }

    public function show(Product $product): ProductDetailResource
    {
        abort_unless($product->aktif, 404, 'Produk tidak ditemukan.');

        $product->load(['category', 'farmer', 'images']);

        return new ProductDetailResource($product);
    }

    /**
     * @param  Builder<Product>  $query
     */
    private function applyFilters(Builder $query, IndexProductRequest $request): void
    {
        if ($search = $request->validated('search')) {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
            });
        }

        if ($category = $request->validated('category')) {
            $query->whereHas('category', fn (Builder $query) => $query->where('slug', $category));
        }

        if ($status = $request->validated('status')) {
            $query->where('status_ketersediaan', $status);
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
