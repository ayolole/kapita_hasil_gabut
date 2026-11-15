<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteSetting\UpdateSiteSettingRequest;
use App\Http\Resources\Admin\SiteSettingResource;
use App\Models\SiteSetting;
use App\Services\ActivityLogger;
use App\Services\ImageCompressor;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function show(): SiteSettingResource|JsonResponse
    {
        $settings = SiteSetting::query()->first();

        if ($settings === null) {
            return response()->json([
                'message' => 'Pengaturan situs belum tersedia.',
            ], 404);
        }

        return new SiteSettingResource($settings);
    }

    public function update(
        UpdateSiteSettingRequest $request,
        ImageCompressor $compressor,
        ActivityLogger $logger,
    ): JsonResponse {
        $settings = SiteSetting::query()->first();
        $isNew = $settings === null;
        $settings ??= new SiteSetting;

        $data = $request->validated();
        unset($data['logo'], $data['hapus_logo']);

        if ($request->hasFile('logo')) {
            $compressor->delete($settings->logo);
            $data['logo'] = $compressor->store($request->file('logo'), 'settings', 'logo-desa');
        } elseif ($request->boolean('hapus_logo')) {
            $compressor->delete($settings->logo);
            $data['logo'] = null;
        }

        $settings->fill($data)->save();

        $logger->record(
            $isNew ? 'tambah' : 'ubah',
            $settings,
            ($isNew ? 'Menambahkan' : 'Mengubah').' pengaturan situs desa.',
        );

        return response()->json([
            'message' => 'Pengaturan situs berhasil disimpan.',
            'data' => new SiteSettingResource($settings->refresh()),
        ]);
    }
}
