<?php

namespace App\Enums;

enum ProductAvailability: string
{
    case Tersedia = 'tersedia';
    case Terbatas = 'terbatas';
    case Habis = 'habis';
    case AkanPanen = 'akan_panen';

    public function label(): string
    {
        return match ($this) {
            self::Tersedia => 'Tersedia',
            self::Terbatas => 'Terbatas',
            self::Habis => 'Habis',
            self::AkanPanen => 'Akan panen',
        };
    }
}
