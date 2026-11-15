<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $categoryId = $this->route('category')?->getKey();

        return [
            'nama' => ['sometimes', 'required', 'string', 'max:80'],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:100',
                'alpha_dash',
                Rule::unique('categories', 'slug')->ignore($categoryId),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nama.required' => 'Nama kategori wajib diisi.',
            'nama.max' => 'Nama kategori terlalu panjang.',
            'slug.alpha_dash' => 'Slug hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
            'slug.unique' => 'Slug kategori sudah dipakai.',
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

        $this->merge($data);
    }
}
