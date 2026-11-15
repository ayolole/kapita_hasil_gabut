<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PageView\StorePageViewRequest;
use App\Models\PageView;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class PageViewController extends Controller
{
    public function store(StorePageViewRequest $request): JsonResponse
    {
        $productId = null;

        if ($slug = $request->validated('product_slug')) {
            $productId = Product::query()->where('slug', $slug)->value('id');
        }

        $pageView = PageView::query()->create([
            'path' => $request->validated('path'),
            'product_id' => $productId,
        ]);

        return response()->json([
            'message' => 'Kunjungan tercatat.',
            'data' => [
                'id' => $pageView->id,
            ],
        ], 201);
    }
}
