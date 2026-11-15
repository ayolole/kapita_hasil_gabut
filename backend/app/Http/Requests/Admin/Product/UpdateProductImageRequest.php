<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductImageRequest extends FormRequest
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
            'alt_text' => ['sometimes', 'nullable', 'string', 'max:150'],
            'urutan' => ['sometimes', 'integer', 'min:0', 'max:999'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'alt_text.max' => 'Teks alternatif terlalu panjang.',
            'urutan.integer' => 'Urutan foto tidak valid.',
            'urutan.min' => 'Urutan foto tidak boleh negatif.',
            'urutan.max' => 'Urutan foto terlalu besar.',
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->exists('alt_text')) {
            $this->merge([
                'alt_text' => filled($this->input('alt_text')) ? trim((string) $this->input('alt_text')) : null,
            ]);
        }
    }
}
