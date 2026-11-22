Add-Type -AssemblyName System.Drawing

$backupDir = "public/_backup_images"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

function Save-JpegCompressed($sourcePath, $destPath, $quality = 82) {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Jpeg.Guid }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    
    $newBitmap = New-Object System.Drawing.Bitmap($img.Width, $img.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($img, 0, 0, $img.Width, $img.Height)
    $graphics.Dispose()
    $img.Dispose()

    $tempDest = "$destPath.tmp"
    $newBitmap.Save($tempDest, $encoder, $encoderParams)
    $newBitmap.Dispose()
    $encoderParams.Dispose()

    Move-Item -Path $tempDest -Destination $destPath -Force
}

function Save-PngResized($sourcePath, $destPath, $targetWidth) {
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    $ratio = $targetWidth / $img.Width
    $targetHeight = [int]($img.Height * $ratio)

    $newBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($img, 0, 0, $targetWidth, $targetHeight)
    $graphics.Dispose()
    $img.Dispose()

    $tempDest = "$destPath.tmp"
    $newBitmap.Save($tempDest, [System.Drawing.Imaging.ImageFormat]::Png)
    $newBitmap.Dispose()

    Move-Item -Path $tempDest -Destination $destPath -Force
}

# 1. Backup originals
@("logo.png", "about-us.png", "banking-services.png", "favicon.png") | ForEach-Object {
    $src = Join-Path "public" $_
    $bak = Join-Path $backupDir $_
    if ((Test-Path $src) -and (-not (Test-Path $bak))) {
        Copy-Item -Path $src -Destination $bak -Force
        Write-Host "Backed up $_ to $bak"
    }
}

# 2. Optimize logo.png (originally 1536x1024, 2.14MB -> resize to 600px width)
Write-Host "Optimizing logo.png..."
Save-PngResized "$backupDir/logo.png" "public/logo.png" 600

# 3. Optimize favicon.png (originally 512x512, 186KB -> resize to 192x192)
Write-Host "Optimizing favicon.png..."
Save-PngResized "$backupDir/favicon.png" "public/favicon.png" 192

# 4. Optimize about-us.png (originally 842KB JPEG)
Write-Host "Optimizing about-us.png..."
Save-JpegCompressed "$backupDir/about-us.png" "public/about-us.png" 82

# 5. Optimize banking-services.png (originally 521KB JPEG)
Write-Host "Optimizing banking-services.png..."
Save-JpegCompressed "$backupDir/banking-services.png" "public/banking-services.png" 82

Write-Host "Image optimization complete!"
