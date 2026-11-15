<?php

namespace App\Http\Requests\Admin\Farmer;

use Illuminate\Foundation\Http\FormRequest;

class StoreFarmerRequest extends FormRequest
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
            'kelompok' => ['nullable', 'string', 'max:120'],
            'cerita' => ['nullable', 'string', 'max:5000'],
            'lokasi_lahan' => ['nullable', 'string', 'max:255'],
            'kontak_internal' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]*$/'],
            'foto' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
                'dimensions:max_width=6000,max_height=6000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama petani wajib diisi.',
            'nama.max' => 'Nama petani terlalu panjang.',
            'kelompok.max' => 'Nama kelompok terlalu panjang.',
            'cerita.max' => 'Cerita petani terlalu panjang.',
            'lokasi_lahan.max' => 'Lokasi lahan terlalu panjang.',
            'kontak_internal.max' => 'Kontak internal terlalu panjang.',
            'kontak_internal.regex' => 'Kontak internal hanya boleh berisi angka, spasi, tanda hubung, dan tanda plus.',
            'foto.image' => 'Berkas harus berupa gambar.',
            'foto.mimes' => 'Foto harus berformat JPG, PNG, atau WEBP.',
            'foto.max' => 'Ukuran foto maksimal 5 MB.',
            'foto.dimensions' => 'Dimensi foto terlalu besar (maksimal 6000 x 6000 piksel).',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nama' => trim((string) $this->input('nama')),
            'kelompok' => filled($this->input('kelompok')) ? trim((string) $this->input('kelompok')) : null,
            'cerita' => filled($this->input('cerita')) ? trim((string) $this->input('cerita')) : null,
            'lokasi_lahan' => filled($this->input('lokasi_lahan')) ? trim((string) $this->input('lokasi_lahan')) : null,
            'kontak_internal' => filled($this->input('kontak_internal')) ? trim((string) $this->input('kontak_internal')) : null,
        ]);
    }
}
