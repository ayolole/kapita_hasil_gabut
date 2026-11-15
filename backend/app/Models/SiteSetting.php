<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'nama_desa',
    'tagline',
    'nomor_whatsapp',
    'template_pesan',
    'logo',
    'media_sosial',
])]
class SiteSetting extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'media_sosial' => 'array',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrFail();
    }
}
