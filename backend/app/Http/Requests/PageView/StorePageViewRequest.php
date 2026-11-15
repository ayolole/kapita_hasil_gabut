<?php

namespace App\Http\Requests\PageView;

use Illuminate\Foundation\Http\FormRequest;

class StorePageViewRequest extends FormRequest
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
            'path' => ['required', 'string', 'max:255'],
            'product_slug' => ['sometimes', 'nullable', 'string', 'max:255', 'exists:products,slug'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'path.required' => 'Path halaman wajib diisi.',
            'path.string' => 'Path halaman tidak valid.',
            'path.max' => 'Path halaman terlalu panjang.',
            'product_slug.exists' => 'Produk tidak ditemukan.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'path' => trim((string) $this->input('path')),
            'product_slug' => filled($this->input('product_slug'))
                ? trim((string) $this->input('product_slug'))
                : null,
        ]);
    }
}
