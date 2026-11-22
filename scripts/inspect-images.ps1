Add-Type -AssemblyName System.Drawing

$files = @("logo.png", "logo1.png", "logo2.png", "logo3.png", "about-us.png", "banking-services.png", "favicon.png")
foreach ($f in $files) {
    $path = Join-Path "public" $f
    if (Test-Path $path) {
        $img = [System.Drawing.Image]::FromFile((Resolve-Path $path))
        $fi = Get-Item $path
        Write-Host "$f - $($fi.Length) bytes - $($img.Width)x$($img.Height) - PixelFormat: $($img.PixelFormat) - RawFormat: $($img.RawFormat.Guid)"
        $img.Dispose()
    }
}
