Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$distDir = (Get-Item "dist").FullName
$zipFile = Join-Path (Get-Item ".").FullName "dist-lightweight.zip"

if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($zipFile, [System.IO.Compression.ZipArchiveMode]::Create)
$files = Get-ChildItem -Path $distDir -Recurse -File

foreach ($f in $files) {
    if ($f.Extension -ieq '.mp4') {
        continue
    }
    if ($f.Name -ieq 'plots_overrides.json') {
        continue
    }
    $relPath = $f.FullName.Substring($distDir.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f.FullName, $relPath, [System.IO.Compression.CompressionLevel]::Optimal)
}

$zip.Dispose()
$mb = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host "Created dist-lightweight.zip successfully. Size: $mb MB"
