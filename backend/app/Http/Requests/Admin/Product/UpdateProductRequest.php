<?php

namespace App\Http\Requests\Admin\Product;

use App\Enums\ProductAvailability;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $productId = $this->route('product')?->getKey();

        return [
            'nama' => ['sometimes', 'required', 'string', 'max:120'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:140',
                'alpha_dash',
                Rule::unique('products', 'slug')->ignore($productId),
            ],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
            'farmer_id' => ['sometimes', 'required', 'integer', 'exists:farmers,id'],
            'deskripsi' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'spesifikasi' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'satuan' => ['sometimes', 'required', 'string', 'max:30'],
            'status_ketersediaan' => ['sometimes', Rule::enum(ProductAvailability::class)],
            'stok' => ['sometimes', 'numeric', 'min:0', 'max:99999999'],
            'estimasi_panen' => ['sometimes', 'nullable', 'date'],
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
        $data = [];

        if ($this->has('nama')) {
            $data['nama'] = trim((string) $this->input('nama'));
        }

        if ($this->has('slug')) {
            $data['slug'] = filled($this->input('slug')) ? Str::slug((string) $this->input('slug')) : null;
        }

        if ($this->has('satuan')) {
            $data['satuan'] = trim((string) $this->input('satuan'));
        }

        if ($this->has('deskripsi')) {
            $data['deskripsi'] = filled($this->input('deskripsi')) ? trim((string) $this->input('deskripsi')) : null;
        }

        if ($this->has('spesifikasi')) {
            $data['spesifikasi'] = filled($this->input('spesifikasi')) ? trim((string) $this->input('spesifikasi')) : null;
        }

        if ($this->has('status_ketersediaan') && filled($this->input('status_ketersediaan'))) {
            $data['status_ketersediaan'] = Str::lower((string) $this->input('status_ketersediaan'));
        }

        if ($this->has('estimasi_panen') && blank($this->input('estimasi_panen'))) {
            $data['estimasi_panen'] = null;
        }

        $this->merge($data);
    }
}
