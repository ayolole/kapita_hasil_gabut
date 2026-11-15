<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Page\StorePageRequest;
use App\Http\Requests\Admin\Page\UpdatePageRequest;
use App\Http\Resources\Admin\PageResource;
use App\Models\Page;
use App\Services\ActivityLogger;
use App\Services\Slugger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Page::query()->orderBy('judul');

        if ($search = trim((string) $request->query('search'))) {
            $query->where(function ($query) use ($search): void {
                $query->where('judul', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        return PageResource::collection($query->get());
    }

    public function store(StorePageRequest $request, ActivityLogger $logger, Slugger $slugger): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $slugger->unique(Page::class, (string) ($data['slug'] ?? $data['judul']));

        $page = Page::query()->create($data);

        $logger->record('tambah', $page, 'Menambahkan halaman '.$page->judul.'.');

        return response()->json([
            'message' => 'Halaman berhasil ditambahkan.',
            'data' => new PageResource($page),
        ], 201);
    }

    public function show(Page $page): PageResource
    {
        return new PageResource($page);
    }

    public function update(
        UpdatePageRequest $request,
        Page $page,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();

        if (array_key_exists('slug', $data) && blank($data['slug'])) {
            unset($data['slug']);
        }

        $page->update($data);

        $logger->record('ubah', $page, 'Mengubah halaman '.$page->judul.'.');

        return response()->json([
            'message' => 'Halaman berhasil diperbarui.',
            'data' => new PageResource($page),
        ]);
    }

    public function destroy(Page $page, ActivityLogger $logger): JsonResponse
    {
        $page->delete();

        $logger->record('hapus', $page, 'Menghapus halaman '.$page->judul.'.');

        return response()->json([
            'message' => 'Halaman berhasil dihapus.',
        ]);
    }
}
