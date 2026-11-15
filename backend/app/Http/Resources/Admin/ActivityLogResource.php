<?php

namespace App\Http\Resources\Admin;

use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ActivityLog
 */
class ActivityLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'aksi' => $this->aksi,
            'deskripsi' => $this->deskripsi,
            'subjek' => $this->subject_type === null ? null : [
                'tipe' => class_basename((string) $this->subject_type),
                'id' => $this->subject_id,
            ],
            'pengguna' => $this->whenLoaded('user', fn (): ?array => $this->user === null ? null : [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'dibuat_pada' => $this->created_at?->toIso8601String(),
        ];
    }
}
