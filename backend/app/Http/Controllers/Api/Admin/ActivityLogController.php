<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActivityLog\IndexActivityLogRequest;
use App\Http\Resources\Admin\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ActivityLogController extends Controller
{
    public function index(IndexActivityLogRequest $request): AnonymousResourceCollection
    {
        $query = ActivityLog::query()->with('user');

        if ($aksi = $request->validated('aksi')) {
            $query->where('aksi', $aksi);
        }

        if ($userId = $request->validated('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($search = $request->validated('search')) {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('deskripsi', 'like', "%{$search}%")
                    ->orWhere('aksi', 'like', "%{$search}%");
            });
        }

        if ($dari = $request->validated('dari')) {
            $query->whereDate('created_at', '>=', $dari);
        }

        if ($sampai = $request->validated('sampai')) {
            $query->whereDate('created_at', '<=', $sampai);
        }

        return ActivityLogResource::collection(
            $query->latest()->paginate($request->integer('per_page', 20))->withQueryString(),
        );
    }

    public function show(ActivityLog $activityLog): ActivityLogResource
    {
        $activityLog->load('user');

        return new ActivityLogResource($activityLog);
    }
}
