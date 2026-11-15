<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Slugger
{
    /**
     * Build a unique slug for the given model class, ignoring the given key.
     *
     * @param  class-string<Model>  $modelClass
     */
    public function unique(string $modelClass, string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value);

        if ($base === '') {
            $base = 'item';
        }

        $query = $modelClass::query();

        if (in_array(SoftDeletes::class, class_uses_recursive($modelClass), true)) {
            $query->withTrashed();
        }

        $slug = $base;
        $suffix = 2;

        while (true) {
            $exists = (clone $query)
                ->where('slug', $slug)
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists();

            if (! $exists) {
                return $slug;
            }

            $slug = $base.'-'.$suffix;
            $suffix++;
        }
    }
}
