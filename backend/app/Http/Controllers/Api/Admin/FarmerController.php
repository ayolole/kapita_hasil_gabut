<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Farmer\IndexFarmerRequest;
use App\Http\Requests\Admin\Farmer\StoreFarmerRequest;
use App\Http\Requests\Admin\Farmer\UpdateFarmerRequest;
use App\Http\Resources\Admin\FarmerDetailResource;
use App\Http\Resources\Admin\FarmerResource;
use App\Models\Farmer;
use App\Services\ActivityLogger;
use App\Services\ImageCompressor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class FarmerController extends Controller
{
    public function index(IndexFarmerRequest $request): AnonymousResourceCollection
    {
        $query = Farmer::query()->withCount('products')->orderBy('nama');

        if ($search = $request->validated('search')) {
            $query->where(function ($query) use ($search): void {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('kelompok', 'like', "%{$search}%");
            });
        }

        return FarmerResource::collection(
            $query->paginate($request->integer('per_page', 20))->withQueryString(),
        );
    }

    public function store(
        StoreFarmerRequest $request,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();
        unset($data['foto']);

        if ($request->hasFile('foto')) {
            $data['foto'] = $compressor->store($request->file('foto'), 'farmers', $data['nama']);
        }

        $farmer = Farmer::query()->create($data);
        $farmer->loadCount('products');

        $logger->record('tambah', $farmer, 'Menambahkan petani '.$farmer->nama.'.');

        return response()->json([
            'message' => 'Petani berhasil ditambahkan.',
            'data' => new FarmerResource($farmer),
        ], 201);
    }

    public function show(Farmer $farmer): FarmerDetailResource
    {
        $farmer->loadCount('products');
        $farmer->load([
            'products' => fn ($query) => $query
                ->with(['category', 'farmer', 'images'])
                ->withCount('images')
                ->orderBy('nama'),
        ]);

        return new FarmerDetailResource($farmer);
    }

    public function update(
        UpdateFarmerRequest $request,
        Farmer $farmer,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        $data = $request->validated();
        unset($data['foto'], $data['hapus_foto']);

        if ($request->hasFile('foto')) {
            $compressor->delete($farmer->foto);
            $data['foto'] = $compressor->store($request->file('foto'), 'farmers', $farmer->nama);
        } elseif ($request->boolean('hapus_foto')) {
            $compressor->delete($farmer->foto);
            $data['foto'] = null;
        }

        $farmer->update($data);
        $farmer->loadCount('products');

        $logger->record('ubah', $farmer, 'Mengubah data petani '.$farmer->nama.'.');

        return response()->json([
            'message' => 'Data petani berhasil diperbarui.',
            'data' => new FarmerResource($farmer),
        ]);
    }

    public function destroy(
        Farmer $farmer,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        if ($farmer->products()->exists()) {
            throw ValidationException::withMessages([
                'petani' => 'Petani masih memiliki produk sehingga tidak dapat dihapus.',
            ]);
        }

        $compressor->delete($farmer->foto);
        $farmer->delete();

        $logger->record('hapus', $farmer, 'Menghapus petani '.$farmer->nama.'.');

        return response()->json([
            'message' => 'Petani berhasil dihapus.',
        ]);
    }
}
