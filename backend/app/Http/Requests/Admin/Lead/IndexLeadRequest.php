<?php

namespace App\Http\Requests\Admin\Lead;

use App\Enums\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class IndexLeadRequest extends FormRequest
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
            'status' => ['sometimes', 'nullable', Rule::enum(LeadStatus::class)],
            'product_id' => ['sometimes', 'nullable', 'integer', 'exists:products,id'],
            'dari' => ['sometimes', 'nullable', 'date'],
            'sampai' => ['sometimes', 'nullable', 'date', 'after_or_equal:dari'],
            'sort' => ['sometimes', 'nullable', 'in:terbaru,terlama'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
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
            'status.enum' => 'Status lead tidak dikenal.',
            'product_id.integer' => 'Produk tidak valid.',
            'product_id.exists' => 'Produk tidak ditemukan.',
            'dari.date' => 'Tanggal awal tidak valid.',
            'sampai.date' => 'Tanggal akhir tidak valid.',
            'sampai.after_or_equal' => 'Tanggal akhir harus setelah tanggal awal.',
            'sort.in' => 'Urutan lead tidak dikenal.',
            'page.integer' => 'Nomor halaman tidak valid.',
            'page.min' => 'Nomor halaman minimal 1.',
            'per_page.integer' => 'Jumlah per halaman tidak valid.',
            'per_page.min' => 'Jumlah per halaman minimal 1.',
            'per_page.max' => 'Jumlah per halaman maksimal 100.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'search' => filled($this->input('search')) ? trim((string) $this->input('search')) : null,
            'status' => filled($this->input('status')) ? Str::lower((string) $this->input('status')) : null,
            'sort' => filled($this->input('sort')) ? Str::lower((string) $this->input('sort')) : null,
        ]);
    }
}
