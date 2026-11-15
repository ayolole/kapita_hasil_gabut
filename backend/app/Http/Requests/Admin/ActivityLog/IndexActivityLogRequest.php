<?php

namespace App\Http\Requests\Admin\ActivityLog;

use Illuminate\Foundation\Http\FormRequest;

class IndexActivityLogRequest extends FormRequest
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
            'aksi' => ['sometimes', 'nullable', 'in:tambah,ubah,hapus'],
            'user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'dari' => ['sometimes', 'nullable', 'date'],
            'sampai' => ['sometimes', 'nullable', 'date', 'after_or_equal:dari'],
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
            'aksi.in' => 'Jenis aksi tidak dikenal.',
            'user_id.integer' => 'Pengguna tidak valid.',
            'user_id.exists' => 'Pengguna tidak ditemukan.',
            'search.string' => 'Kata kunci pencarian tidak valid.',
            'search.max' => 'Kata kunci pencarian terlalu panjang.',
            'dari.date' => 'Tanggal awal tidak valid.',
            'sampai.date' => 'Tanggal akhir tidak valid.',
            'sampai.after_or_equal' => 'Tanggal akhir harus setelah tanggal awal.',
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
            'aksi' => filled($this->input('aksi')) ? trim((string) $this->input('aksi')) : null,
            'search' => filled($this->input('search')) ? trim((string) $this->input('search')) : null,
        ]);
    }
}
