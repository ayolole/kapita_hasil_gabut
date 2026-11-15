<?php

namespace App\Http\Requests\Admin\Page;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePageRequest extends FormRequest
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
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash', Rule::unique('pages', 'slug')],
            'judul' => ['required', 'string', 'max:150'],
            'isi' => ['required', 'string', 'max:50000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.alpha_dash' => 'Slug hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
            'slug.unique' => 'Slug halaman sudah dipakai.',
            'judul.required' => 'Judul halaman wajib diisi.',
            'judul.max' => 'Judul halaman terlalu panjang.',
            'isi.required' => 'Isi halaman wajib diisi.',
            'isi.max' => 'Isi halaman terlalu panjang.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => filled($this->input('slug')) ? Str::slug((string) $this->input('slug')) : null,
            'judul' => trim((string) $this->input('judul')),
            'isi' => trim((string) $this->input('isi')),
        ]);
    }
}
