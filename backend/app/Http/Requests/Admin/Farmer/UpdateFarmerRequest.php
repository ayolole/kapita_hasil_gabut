<?php

namespace App\Http\Requests\Admin\Farmer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFarmerRequest extends FormRequest
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
            'nama' => ['sometimes', 'required', 'string', 'max:120'],
            'kelompok' => ['sometimes', 'nullable', 'string', 'max:120'],
            'cerita' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'lokasi_lahan' => ['sometimes', 'nullable', 'string', 'max:255'],
            'kontak_internal' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s()]*$/'],
            'foto' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
                'dimensions:max_width=6000,max_height=6000',
            ],
            'hapus_foto' => ['sometimes', 'boolean'],
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
            'hapus_foto.boolean' => 'Pilihan hapus foto tidak valid.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->exists('nama')) {
            $data['nama'] = trim((string) $this->input('nama'));
        }

        foreach (['kelompok', 'cerita', 'lokasi_lahan', 'kontak_internal'] as $field) {
            if ($this->exists($field)) {
                $data[$field] = filled($this->input($field)) ? trim((string) $this->input($field)) : null;
            }
        }

        $this->merge($data);
    }
}
