<?php

namespace App\Enums;

enum LeadStatus: string
{
    case Baru = 'baru';
    case Dihubungi = 'dihubungi';
    case Selesai = 'selesai';
    case Batal = 'batal';

    public function label(): string
    {
        return match ($this) {
            self::Baru => 'Baru',
            self::Dihubungi => 'Dihubungi',
            self::Selesai => 'Selesai',
            self::Batal => 'Batal',
        };
    }
}
