<?php

use App\Http\Controllers\Api\Admin\ActivityLogController as AdminActivityLogController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\FarmerController as AdminFarmerController;
use App\Http\Controllers\Api\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\Admin\PageController as AdminPageController;
use App\Http\Controllers\Api\Admin\ProductAvailabilityController as AdminProductAvailabilityController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductImageController as AdminProductImageController;
use App\Http\Controllers\Api\Admin\SiteSettingController as AdminSiteSettingController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FarmerController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PageViewController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SiteSettingController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product:slug}', [ProductController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/farmers', [FarmerController::class, 'index']);
Route::get('/farmers/{farmer}', [FarmerController::class, 'show'])->whereNumber('farmer');

Route::get('/pages/{page:slug}', [PageController::class, 'show']);

Route::get('/settings/public', [SiteSettingController::class, 'publicSettings']);

Route::post('/leads', [LeadController::class, 'store'])->middleware('throttle:leads');

Route::post('/track', [PageViewController::class, 'store'])->middleware('throttle:track');

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->prefix('admin')->group(function (): void {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/stats', [AdminDashboardController::class, 'stats']);

    Route::get('/activity-logs', [AdminActivityLogController::class, 'index']);
    Route::get('/activity-logs/{activityLog}', [AdminActivityLogController::class, 'show'])
        ->whereNumber('activityLog');

    Route::get('/products', [AdminProductController::class, 'index']);
    Route::post('/products', [AdminProductController::class, 'store']);
    Route::get('/products/{product}', [AdminProductController::class, 'show'])->whereNumber('product');
    Route::match(['put', 'patch'], '/products/{product}', [AdminProductController::class, 'update'])
        ->whereNumber('product');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->whereNumber('product');
    Route::post('/products/{product}/restore', [AdminProductController::class, 'restore'])
        ->whereNumber('product');

    Route::patch('/products/{product}/availability', [AdminProductAvailabilityController::class, 'update'])
        ->whereNumber('product');

    Route::post('/products/{product}/images', [AdminProductImageController::class, 'store'])
        ->whereNumber('product');
    Route::patch('/products/{product}/images/{image}', [AdminProductImageController::class, 'update'])
        ->whereNumber('product')
        ->whereNumber('image');
    Route::delete('/products/{product}/images/{image}', [AdminProductImageController::class, 'destroy'])
        ->whereNumber('product')
        ->whereNumber('image');

    Route::get('/categories', [AdminCategoryController::class, 'index']);
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::get('/categories/{category}', [AdminCategoryController::class, 'show'])->whereNumber('category');
    Route::match(['put', 'patch'], '/categories/{category}', [AdminCategoryController::class, 'update'])
        ->whereNumber('category');
    Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])
        ->whereNumber('category');

    Route::get('/farmers', [AdminFarmerController::class, 'index']);
    Route::post('/farmers', [AdminFarmerController::class, 'store']);
    Route::get('/farmers/{farmer}', [AdminFarmerController::class, 'show'])->whereNumber('farmer');
    Route::match(['put', 'patch'], '/farmers/{farmer}', [AdminFarmerController::class, 'update'])
        ->whereNumber('farmer');
    Route::delete('/farmers/{farmer}', [AdminFarmerController::class, 'destroy'])->whereNumber('farmer');

    Route::get('/leads/export', [AdminLeadController::class, 'export']);
    Route::get('/leads', [AdminLeadController::class, 'index']);
    Route::get('/leads/{lead}', [AdminLeadController::class, 'show'])->whereNumber('lead');
    Route::patch('/leads/{lead}', [AdminLeadController::class, 'update'])->whereNumber('lead');

    Route::get('/settings', [AdminSiteSettingController::class, 'show']);
    Route::match(['put', 'patch'], '/settings', [AdminSiteSettingController::class, 'update']);

    Route::get('/pages', [AdminPageController::class, 'index']);
    Route::post('/pages', [AdminPageController::class, 'store']);
    Route::get('/pages/{page}', [AdminPageController::class, 'show'])->whereNumber('page');
    Route::match(['put', 'patch'], '/pages/{page}', [AdminPageController::class, 'update'])
        ->whereNumber('page');
    Route::delete('/pages/{page}', [AdminPageController::class, 'destroy'])->whereNumber('page');
});
