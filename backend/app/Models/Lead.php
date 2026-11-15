<?php

namespace App\Models;

use App\Enums\LeadStatus;
use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_id',
    'jumlah',
    'nama_pembeli',
    'kebutuhan',
    'catatan',
    'status',
    'catatan_admin',
])]
class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'jumlah' => 'decimal:2',
            'status' => LeadStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Lead $lead): void {
            if (blank($lead->kode_ref)) {
                $lead->kode_ref = static::nextKodeRef();
            }
        });
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    private static function nextKodeRef(): string
    {
        $lastNumber = static::query()
            ->pluck('kode_ref')
            ->reduce(fn (int $carry, string $kodeRef): int => max($carry, (int) substr($kodeRef, 3)), 0);

        return 'LD-'.str_pad((string) ($lastNumber + 1), 6, '0', STR_PAD_LEFT);
    }
}
