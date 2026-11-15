<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductAvailability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'nama' => ['required', 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:140', 'alpha_dash', 'unique:products,slug'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'farmer_id' => ['required', 'integer', 'exists:farmers,id'],
            'deskripsi' => ['nullable', 'string', 'max:2000'],
            'spesifikasi' => ['nullable', 'string', 'max:2000'],
            'satuan' => ['required', 'string', 'max:30'],
            'status_ketersediaan' => ['sometimes', Rule::enum(ProductAvailability::class)],
            'stok' => ['sometimes', 'numeric', 'min:0', 'max:99999999'],
            'estimasi_panen' => ['nullable', 'date'],
            'aktif' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama produk wajib diisi.',
            'nama.max' => 'Nama produk terlalu panjang.',
            'slug.alpha_dash' => 'Slug hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
            'slug.unique' => 'Slug produk sudah dipakai.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'farmer_id.required' => 'Petani wajib dipilih.',
            'farmer_id.exists' => 'Petani tidak ditemukan.',
            'deskripsi.max' => 'Deskripsi terlalu panjang.',
            'spesifikasi.max' => 'Spesifikasi terlalu panjang.',
            'satuan.required' => 'Satuan wajib diisi.',
            'satuan.max' => 'Satuan terlalu panjang.',
            'status_ketersediaan.enum' => 'Status ketersediaan tidak dikenal.',
            'stok.numeric' => 'Stok harus berupa angka.',
            'stok.min' => 'Stok tidak boleh negatif.',
            'stok.max' => 'Stok terlalu besar.',
            'estimasi_panen.date' => 'Tanggal estimasi panen tidak valid.',
            'aktif.boolean' => 'Status aktif tidak valid.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama' => trim((string) $this->input('nama')),
            'slug' => filled($this->input('slug')) ? Str::slug((string) $this->input('slug')) : null,
            'deskripsi' => filled($this->input('deskripsi')) ? trim((string) $this->input('deskripsi')) : null,
            'spesifikasi' => filled($this->input('spesifikasi')) ? trim((string) $this->input('spesifikasi')) : null,
            'satuan' => trim((string) $this->input('satuan')),
            'status_ketersediaan' => filled($this->input('status_ketersediaan'))
                ? Str::lower((string) $this->input('status_ketersediaan'))
                : ProductAvailability::Tersedia->value,
        ]);
    }
}
