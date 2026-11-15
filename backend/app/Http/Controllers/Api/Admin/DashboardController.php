<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\LeadStatus;
use App\Enums\ProductAvailability;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\ActivityLogResource;
use App\Http\Resources\Admin\LeadResource;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Farmer;
use App\Models\Lead;
use App\Models\PageView;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $startOfMonth = now()->startOfMonth();

        return response()->json([
            'data' => [
                'produk' => [
                    'total' => Product::withTrashed()->count(),
                    'aktif' => Product::query()->where('aktif', true)->count(),
                    'nonaktif' => Product::query()->where('aktif', false)->count(),
                    'habis' => Product::query()
                        ->where('status_ketersediaan', ProductAvailability::Habis)
                        ->count(),
                    'akan_panen' => Product::query()
                        ->where('status_ketersediaan', ProductAvailability::AkanPanen)
                        ->count(),
                ],
                'kategori' => Category::query()->count(),
                'petani' => Farmer::query()->count(),
                'leads' => [
                    'total' => Lead::query()->count(),
                    'baru' => Lead::query()->where('status', LeadStatus::Baru)->count(),
                    'dihubungi' => Lead::query()->where('status', LeadStatus::Dihubungi)->count(),
                    'selesai' => Lead::query()->where('status', LeadStatus::Selesai)->count(),
                    'batal' => Lead::query()->where('status', LeadStatus::Batal)->count(),
                    'bulan_ini' => Lead::query()->where('created_at', '>=', $startOfMonth)->count(),
                ],
                'kunjungan' => [
                    'total' => PageView::query()->count(),
                    'bulan_ini' => PageView::query()->where('created_at', '>=', $startOfMonth)->count(),
                ],
                'produk_terpopuler' => Product::query()
                    ->withCount('pageViews')
                    ->orderByDesc('page_views_count')
                    ->orderBy('nama')
                    ->limit(5)
                    ->get(['id', 'nama', 'slug'])
                    ->map(fn (Product $product): array => [
                        'id' => $product->id,
                        'nama' => $product->nama,
                        'slug' => $product->slug,
                        'jumlah_kunjungan' => $product->page_views_count,
                    ]),
                'lead_terbaru' => LeadResource::collection(
                    Lead::query()
                        ->with(['product' => fn ($query) => $query->withTrashed()])
                        ->latest()
                        ->limit(5)
                        ->get(),
                ),
                'aktivitas_terbaru' => ActivityLogResource::collection(
                    ActivityLog::query()->with('user')->latest()->limit(5)->get(),
                ),
            ],
        ]);
    }
}
