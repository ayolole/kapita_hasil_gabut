<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductAvailability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'status_ketersediaan' => ['required', Rule::enum(ProductAvailability::class)],
            'stok' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:99999999'],
            'estimasi_panen' => ['sometimes', 'nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status_ketersediaan.required' => 'Status ketersediaan wajib dipilih.',
            'status_ketersediaan.enum' => 'Status ketersediaan tidak dikenal.',
            'stok.numeric' => 'Stok harus berupa angka.',
            'stok.min' => 'Stok tidak boleh negatif.',
            'stok.max' => 'Stok terlalu besar.',
            'estimasi_panen.date' => 'Tanggal estimasi panen tidak valid.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status_ketersediaan' => Str::lower((string) $this->input('status_ketersediaan')),
        ]);
    }
}
