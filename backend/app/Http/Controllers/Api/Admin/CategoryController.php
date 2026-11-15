<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Category\StoreCategoryRequest;
use App\Http\Requests\Admin\Category\UpdateCategoryRequest;
use App\Http\Resources\Admin\CategoryResource;
use App\Models\Category;
use App\Services\ActivityLogger;
use App\Services\Slugger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Category::query()->withCount('products')->orderBy('nama');

        if ($search = trim((string) $request->query('search'))) {
            $query->where('nama', 'like', "%{$search}%");
        }

        return CategoryResource::collection($query->get());
    }

    public function store(StoreCategoryRequest $request, ActivityLogger $logger, Slugger $slugger): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $slugger->unique(Category::class, (string) ($data['slug'] ?? $data['nama']));

        $category = Category::query()->create($data);
        $category->loadCount('products');

        $logger->record('tambah', $category, 'Menambahkan kategori '.$category->nama.'.');

        return response()->json([
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function show(Category $category): CategoryResource
    {
        $category->loadCount('products');

        return new CategoryResource($category);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && blank($data['slug'])) {
            unset($data['slug']);
        }

        $category->update($data);
        $category->loadCount('products');

        $logger->record('ubah', $category, 'Mengubah kategori '.$category->nama.'.');

        return response()->json([
            'message' => 'Kategori berhasil diperbarui.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function destroy(Category $category, ActivityLogger $logger): JsonResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'kategori' => 'Kategori masih dipakai oleh produk sehingga tidak dapat dihapus.',
            ]);
        }

        $category->delete();

        $logger->record('hapus', $category, 'Menghapus kategori '.$category->nama.'.');

        return response()->json([
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
