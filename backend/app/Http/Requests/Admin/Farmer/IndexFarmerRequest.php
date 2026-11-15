<?php

namespace App\Http\Requests\Admin\Farmer;

use Illuminate\Foundation\Http\FormRequest;

class IndexFarmerRequest extends FormRequest
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
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'search.string' => 'Kata kunci pencarian tidak valid.',
            'search.max' => 'Kata kunci pencarian terlalu panjang.',
            'page.integer' => 'Nomor halaman tidak valid.',
            'page.min' => 'Nomor halaman minimal 1.',
            'per_page.integer' => 'Jumlah per halaman tidak valid.',
            'per_page.min' => 'Jumlah per halaman minimal 1.',
            'per_page.max' => 'Jumlah per halaman maksimal 100.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'search' => filled($this->input('search')) ? trim((string) $this->input('search')) : null,
        ]);
    }
}
