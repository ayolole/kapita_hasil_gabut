<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductImageRequest extends FormRequest
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
            'foto' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
                'dimensions:max_width=6000,max_height=6000',
            ],
            'alt_text' => ['nullable', 'string', 'max:150'],
            'urutan' => ['nullable', 'integer', 'min:0', 'max:999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'foto.required' => 'Foto produk wajib dipilih.',
            'foto.image' => 'Berkas harus berupa gambar.',
            'foto.mimes' => 'Foto harus berformat JPG, PNG, atau WEBP.',
            'foto.max' => 'Ukuran foto maksimal 5 MB.',
            'foto.dimensions' => 'Dimensi foto terlalu besar (maksimal 6000 x 6000 piksel).',
            'alt_text.max' => 'Teks alternatif terlalu panjang.',
            'urutan.integer' => 'Urutan foto tidak valid.',
            'urutan.min' => 'Urutan foto tidak boleh negatif.',
            'urutan.max' => 'Urutan foto terlalu besar.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'alt_text' => filled($this->input('alt_text')) ? trim((string) $this->input('alt_text')) : null,
        ]);
    }
}
