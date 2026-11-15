<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class ImageCompressor
{
    private const MAX_DIMENSION = 1600;

    private const QUALITY = 82;

    /**
     * Compress an uploaded image and store it as a JPEG on the public disk.
     *
     * @return string The stored path relative to the public disk.
     */
    public function store(UploadedFile $file, string $directory, string $basename): string
    {
        if (! function_exists('imagecreatefromstring')) {
            throw new RuntimeException('Ekstensi GD tidak tersedia untuk memproses gambar.');
        }

        $contents = file_get_contents($file->getRealPath());

        if ($contents === false) {
            throw new RuntimeException('Berkas gambar tidak dapat dibaca.');
        }

        $source = @imagecreatefromstring($contents);

        if (! $source instanceof \GdImage) {
            throw new RuntimeException('Format gambar tidak didukung.');
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, self::MAX_DIMENSION / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $white);
        imagecopyresampled(
            $canvas,
            $source,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $width,
            $height,
        );

        ob_start();
        imagejpeg($canvas, null, self::QUALITY);
        $binary = (string) ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        $path = trim($directory, '/').'/'.Str::slug($basename).'-'.Str::lower(Str::random(8)).'.jpg';

        Storage::disk('public')->put($path, $binary);

        return $path;
    }

    public function delete(?string $path): void
    {
        if (filled($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
