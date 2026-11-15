<?php

namespace App\Http\Requests\Admin\Lead;

use App\Enums\LeadStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateLeadRequest extends FormRequest
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
            'status' => ['sometimes', 'required', Rule::enum(LeadStatus::class)],
            'catatan_admin' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Status lead wajib dipilih.',
            'status.enum' => 'Status lead tidak dikenal.',
            'catatan_admin.max' => 'Catatan admin terlalu panjang.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('status')) {
            $data['status'] = Str::lower((string) $this->input('status'));
        }

        if ($this->exists('catatan_admin')) {
            $data['catatan_admin'] = filled($this->input('catatan_admin'))
                ? trim((string) $this->input('catatan_admin'))
                : null;
        }

        $this->merge($data);
    }
}
