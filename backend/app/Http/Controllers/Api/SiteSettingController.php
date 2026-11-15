<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteSettingResource;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SiteSettingController extends Controller
{
    public function publicSettings(): SiteSettingResource|JsonResponse
    {
        $settings = SiteSetting::query()->first();

        if (! $settings) {
            return response()->json([
                'message' => 'Pengaturan situs belum tersedia.',
            ], 404);
        }

        return new SiteSettingResource($settings);
    }
}
