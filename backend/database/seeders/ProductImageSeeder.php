<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        if (! function_exists('imagecreatetruecolor')) {
            $this->command?->warn('Ekstensi GD tidak tersedia; gambar contoh dilewati.');

            return;
        }

        Storage::disk('public')->makeDirectory('products');

        $imageCounts = [
            'pisang-kepok' => 2,
            'pepaya-california' => 2,
            'singkong-mentega' => 2,
        ];

        Product::query()->orderBy('id')->each(function (Product $product) use ($imageCounts): void {
            $count = $imageCounts[$product->slug] ?? 1;

            for ($index = 1; $index <= $count; $index++) {
                $path = "products/{$product->slug}-{$index}.jpg";

                $this->createPlaceholder($product->nama, $product->satuan, $path);

                ProductImage::query()->updateOrCreate(
                    ['product_id' => $product->id, 'path' => $path],
                    [
                        'alt_text' => "Foto contoh {$product->nama}",
                        'urutan' => $index,
                    ],
                );
            }
        });
    }

    private function createPlaceholder(string $productName, string $unit, string $path): void
    {
        $width = 1200;
        $height = 800;
        $image = imagecreatetruecolor($width, $height);

        $palette = [
            [46, 125, 50],
            [245, 124, 0],
            [25, 118, 210],
            [109, 76, 65],
        ];
        [$red, $green, $blue] = $palette[abs(crc32($productName)) % count($palette)];

        $background = imagecolorallocate($image, $red, $green, $blue);
        $darker = imagecolorallocate($image, (int) ($red * 0.7), (int) ($green * 0.7), (int) ($blue * 0.7));
        $white = imagecolorallocate($image, 255, 255, 255);
        $softWhite = imagecolorallocate($image, 245, 245, 240);

        imagefill($image, 0, 0, $background);
        imagefilledrectangle($image, 0, 0, $width, 18, $darker);
        imagefilledrectangle($image, 90, 190, $width - 90, $height - 130, $softWhite);

        $heading = 'KATALOG DESA BANJAR AGUNG';
        $title = strtoupper($productName);
        $subtitle = 'FOTO ILUSTRASI - '.strtoupper($unit);
        $footer = 'GANTI DENGAN FOTO ASLI PRODUK';

        $this->centerText($image, 5, $heading, 115, $darker);
        $this->centerText($image, 5, $title, 360, $background);
        $this->centerText($image, 4, $subtitle, 450, $darker);
        $this->centerText($image, 3, $footer, $height - 90, $darker);

        ob_start();
        imagejpeg($image, null, 78);
        $binary = ob_get_clean();

        imagedestroy($image);

        Storage::disk('public')->put($path, $binary);
    }

    private function centerText(\GdImage $image, int $font, string $text, int $y, int $color): void
    {
        $width = imagefontwidth($font) * strlen($text);
        $x = (int) ((imagesx($image) - $width) / 2);

        imagestring($image, $font, $x, $y, $text, $color);
    }
}
