<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\SiteSetting;

class LeadMessageBuilder
{
    public function __construct(
        private readonly string $templatePesan,
        private readonly string $nomorWhatsapp,
    ) {}

    public static function make(): self
    {
        $settings = SiteSetting::current();

        return new self($settings->template_pesan, $settings->nomor_whatsapp);
    }

    /**
     * @return array{nomor: string, pesan: string, url: string}
     */
    public function build(Lead $lead): array
    {
        $product = $lead->product;
        $jumlah = (float) $lead->jumlah;

        $pesan = strtr($this->templatePesan, [
            '{kode_ref}' => $lead->kode_ref,
            '{nama_produk}' => $product->nama,
            '{jumlah}' => $this->formatJumlah($jumlah),
            '{satuan}' => $product->satuan,
            '{kebutuhan}' => filled($lead->kebutuhan) ? $lead->kebutuhan : '-',
            '{nama_pembeli}' => $lead->nama_pembeli,
            '{catatan}' => filled($lead->catatan) ? $lead->catatan : '-',
        ]);

        $nomor = $this->normalizeNomor($this->nomorWhatsapp);

        return [
            'nomor' => $nomor,
            'pesan' => $pesan,
            'url' => 'https://wa.me/'.$nomor.'?text='.rawurlencode($pesan),
        ];
    }

    private function formatJumlah(float $jumlah): string
    {
        return rtrim(rtrim(number_format($jumlah, 2, ',', '.'), '0'), ',');
    }

    private function normalizeNomor(string $nomor): string
    {
        $digits = (string) preg_replace('/\D+/', '', $nomor);

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        if (str_starts_with($digits, '8')) {
            return '62'.$digits;
        }

        return $digits;
    }
}
