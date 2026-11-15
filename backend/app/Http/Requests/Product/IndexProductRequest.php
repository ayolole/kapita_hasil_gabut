<?php

namespace App\Http\Requests\Product;

use App\Enums\ProductAvailability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IndexProductRequest extends FormRequest
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
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'category' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'nullable', Rule::enum(ProductAvailability::class)],
            'sort' => ['sometimes', 'nullable', 'in:terbaru,nama'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'search.string' => 'Kata kunci pencarian tidak valid.',
            'search.max' => 'Kata kunci pencarian terlalu panjang.',
            'status.enum' => 'Status ketersediaan tidak dikenal.',
            'sort.in' => 'Urutan produk tidak dikenal.',
            'page.integer' => 'Nomor halaman tidak valid.',
            'page.min' => 'Nomor halaman minimal 1.',
            'per_page.integer' => 'Jumlah per halaman tidak valid.',
            'per_page.min' => 'Jumlah per halaman minimal 1.',
            'per_page.max' => 'Jumlah per halaman maksimal 48.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'search' => filled($this->input('search')) ? trim((string) $this->input('search')) : null,
            'category' => filled($this->input('category')) ? Str::slug((string) $this->input('category')) : null,
            'status' => filled($this->input('status')) ? Str::lower((string) $this->input('status')) : null,
            'sort' => filled($this->input('sort')) ? Str::lower((string) $this->input('sort')) : null,
        ]);
    }
}
