<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ActivityLogger
{
    /**
     * Record an add, change, or delete operation performed by the admin.
     */
    public function record(string $aksi, ?Model $subject, string $deskripsi): ActivityLog
    {
        $request = request();

        return ActivityLog::query()->create([
            'user_id' => $request->user()?->getKey(),
            'aksi' => $aksi,
            'deskripsi' => $deskripsi,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
        ]);
    }
}
