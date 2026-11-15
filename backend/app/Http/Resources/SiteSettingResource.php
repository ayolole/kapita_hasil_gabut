<?php

namespace App\Http\Resources;

use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin SiteSetting
 */
class SiteSettingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'nama_desa' => $this->nama_desa,
            'tagline' => $this->tagline,
            'nomor_whatsapp' => $this->nomor_whatsapp,
            'template_pesan' => $this->template_pesan,
            'logo' => $this->logo ? Storage::disk('public')->url($this->logo) : null,
            'media_sosial' => $this->media_sosial,
        ];
    }
}
