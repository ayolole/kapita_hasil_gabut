<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Lead\IndexLeadRequest;
use App\Http\Requests\Admin\Lead\UpdateLeadRequest;
use App\Http\Resources\Admin\LeadResource;
use App\Models\Lead;
use App\Services\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LeadController extends Controller
{
    public function index(IndexLeadRequest $request): AnonymousResourceCollection
    {
        $leads = $this->filteredQuery($request)
            ->with(['product' => fn ($query) => $query->withTrashed()])
            ->paginate($request->integer('per_page', 20))
            ->withQueryString();

        return LeadResource::collection($leads);
    }

    public function show(Lead $lead): LeadResource
    {
        $lead->load(['product' => fn ($query) => $query->withTrashed()]);

        return new LeadResource($lead);
    }

    public function update(
        UpdateLeadRequest $request,
        Lead $lead,
        ActivityLogger $logger,
    ): JsonResponse {
        $lead->update($request->validated());
        $lead->load(['product' => fn ($query) => $query->withTrashed()]);

        $logger->record('ubah', $lead, 'Memperbarui lead '.$lead->kode_ref.'.');

        return response()->json([
            'message' => 'Lead berhasil diperbarui.',
            'data' => new LeadResource($lead),
        ]);
    }

    public function export(IndexLeadRequest $request): StreamedResponse
    {
        $query = $this->filteredQuery($request)
            ->with(['product' => fn ($query) => $query->withTrashed()]);

        $filename = 'leads-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");
            fputcsv($handle, [
                'Kode Referensi',
                'Tanggal',
                'Produk',
                'Kebutuhan',
                'Nama Pemohon',
                'Catatan',
                'Status',
                'Catatan Admin',
            ]);

            foreach ($query->lazy(200) as $lead) {
                fputcsv($handle, [
                    $lead->kode_ref,
                    $lead->created_at?->timezone('Asia/Jakarta')->format('d/m/Y H:i'),
                    $lead->product?->nama ?? '-',
                    $lead->kebutuhan,
                    $lead->nama_pembeli,
                    $lead->catatan,
                    $lead->status->label(),
                    $lead->catatan_admin,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * @return Builder<Lead>
     */
    private function filteredQuery(IndexLeadRequest $request): Builder
    {
        $query = Lead::query();

        if ($search = $request->validated('search')) {
            $query->where(function (Builder $query) use ($search): void {
                $query->where('kode_ref', 'like', "%{$search}%")
                    ->orWhere('nama_pembeli', 'like', "%{$search}%");
            });
        }

        if ($status = $request->validated('status')) {
            $query->where('status', $status);
        }

        if ($productId = $request->validated('product_id')) {
            $query->where('product_id', $productId);
        }

        if ($dari = $request->validated('dari')) {
            $query->whereDate('created_at', '>=', $dari);
        }

        if ($sampai = $request->validated('sampai')) {
            $query->whereDate('created_at', '<=', $sampai);
        }

        return $request->validated('sort') === 'terlama'
            ? $query->orderBy('created_at')->orderBy('id')
            : $query->orderByDesc('created_at')->orderByDesc('id');
    }
}
