<?php

namespace App\Http\Requests\Lead;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadRequest extends FormRequest
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
            'product_slug' => [
                'required',
                'string',
                'max:255',
                Rule::exists('products', 'slug')
                    ->where('aktif', true)
                    ->whereNull('deleted_at'),
            ],
            'jumlah' => ['sometimes', 'nullable', 'numeric', 'min:1', 'max:10000'],
            'nama_pembeli' => ['required', 'string', 'max:100'],
            'kebutuhan' => ['required', 'string', 'max:500'],
            'catatan' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_slug.required' => 'Produk wajib dipilih.',
            'product_slug.string' => 'Produk tidak valid.',
            'product_slug.exists' => 'Produk tidak ditemukan atau sudah tidak aktif.',
            'jumlah.numeric' => 'Jumlah harus berupa angka.',
            'jumlah.min' => 'Jumlah minimal 1.',
            'jumlah.max' => 'Jumlah terlalu besar.',
            'nama_pembeli.required' => 'Nama wajib diisi.',
            'nama_pembeli.string' => 'Nama tidak valid.',
            'nama_pembeli.max' => 'Nama terlalu panjang.',
            'kebutuhan.required' => 'Kebutuhan wajib diisi.',
            'kebutuhan.string' => 'Kebutuhan tidak valid.',
            'kebutuhan.max' => 'Kebutuhan terlalu panjang.',
            'catatan.string' => 'Catatan tidak valid.',
            'catatan.max' => 'Catatan terlalu panjang.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'product_slug' => filled($this->input('product_slug'))
                ? trim((string) $this->input('product_slug'))
                : null,
            'nama_pembeli' => trim((string) $this->input('nama_pembeli')),
            'kebutuhan' => trim((string) $this->input('kebutuhan')),
            'catatan' => filled($this->input('catatan')) ? trim((string) $this->input('catatan')) : null,
        ]);
    }
}
