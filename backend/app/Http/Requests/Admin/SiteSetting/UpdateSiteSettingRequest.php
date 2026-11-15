<?php

namespace App\Http\Requests\Admin\SiteSetting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSiteSettingRequest extends FormRequest
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
            'nama_desa' => ['required', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'nomor_whatsapp' => ['required', 'string', 'max:20', 'regex:/^[0-9+\-\s()]+$/'],
            'template_pesan' => ['required', 'string', 'max:2000'],
            'media_sosial' => ['nullable', 'array'],
            'media_sosial.*' => ['nullable', 'string', 'max:255'],
            'logo' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:3072',
                'dimensions:max_width=4000,max_height=4000',
            ],
            'hapus_logo' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama_desa.required' => 'Nama desa wajib diisi.',
            'nama_desa.max' => 'Nama desa terlalu panjang.',
            'tagline.max' => 'Tagline terlalu panjang.',
            'nomor_whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
            'nomor_whatsapp.max' => 'Nomor WhatsApp terlalu panjang.',
            'nomor_whatsapp.regex' => 'Nomor WhatsApp hanya boleh berisi angka, spasi, tanda hubung, dan tanda plus.',
            'template_pesan.required' => 'Template pesan wajib diisi.',
            'template_pesan.max' => 'Template pesan terlalu panjang.',
            'media_sosial.array' => 'Media sosial tidak valid.',
            'media_sosial.*.max' => 'Tautan media sosial terlalu panjang.',
            'logo.image' => 'Logo harus berupa gambar.',
            'logo.mimes' => 'Logo harus berformat JPG, PNG, atau WEBP.',
            'logo.max' => 'Ukuran logo maksimal 3 MB.',
            'logo.dimensions' => 'Dimensi logo terlalu besar (maksimal 4000 x 4000 piksel).',
            'hapus_logo.boolean' => 'Pilihan hapus logo tidak valid.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $mediaSosial = $this->input('media_sosial');

        if (is_array($mediaSosial)) {
            $mediaSosial = array_filter(
                array_map(
                    fn ($value) => is_string($value) ? trim($value) : $value,
                    $mediaSosial,
                ),
                fn ($value) => filled($value),
            );
        }

        $this->merge([
            'nama_desa' => trim((string) $this->input('nama_desa')),
            'tagline' => filled($this->input('tagline')) ? trim((string) $this->input('tagline')) : null,
            'nomor_whatsapp' => trim((string) $this->input('nomor_whatsapp')),
            'template_pesan' => trim((string) $this->input('template_pesan')),
            'media_sosial' => $mediaSosial,
        ]);
    }
}
