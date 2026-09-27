$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$package = Join-Path $root 'hosting-package'
$adminBuild = Join-Path $root 'admin\build'

Write-Host 'Building the admin panel...'
Push-Location (Join-Path $root 'admin')
try {
    npm install --no-package-lock
    if ($LASTEXITCODE -ne 0) {
        throw 'Admin panel dependency installation failed.'
    }
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw 'Admin panel build failed.'
    }
} finally {
    Pop-Location
}

if (Test-Path $package) {
    Remove-Item -LiteralPath $package -Recurse -Force
}
New-Item -ItemType Directory -Path $package | Out-Null
Copy-Item -Path (Join-Path $root 'public\*') -Destination $package -Recurse -Force
Copy-Item -Path (Join-Path $root 'hosting\.htaccess') -Destination $package
Copy-Item -Path (Join-Path $root 'hosting\install.php') -Destination $package
Copy-Item -Path (Join-Path $root 'hosting\database.sql') -Destination $package

$apiTarget = Join-Path $package 'api'
New-Item -ItemType Directory -Path $apiTarget | Out-Null
Copy-Item -Path (Join-Path $root 'hosting\api\index.php') -Destination $apiTarget
Copy-Item -Path (Join-Path $root 'hosting\api\.htaccess') -Destination $apiTarget

$random = [Security.Cryptography.RandomNumberGenerator]::Create()
$setupBytes = New-Object byte[] 24
$jwtBytes = New-Object byte[] 48
$random.GetBytes($setupBytes)
$random.GetBytes($jwtBytes)
$random.Dispose()
$setupKey = [BitConverter]::ToString($setupBytes).Replace('-', '')
$jwtSecret = [BitConverter]::ToString($jwtBytes).Replace('-', '')
$config = Get-Content -Raw -Path (Join-Path $root 'hosting\api\config.example.php')
$config = $config.Replace('REPLACE_WITH_A_RANDOM_SECRET', $jwtSecret)
$config = $config.Replace('REPLACE_WITH_THE_KEY_PRINTED_BY_THE_PACKAGE_BUILDER', $setupKey)
[System.IO.File]::WriteAllText(
    (Join-Path $apiTarget 'config.php'),
    $config,
    (New-Object System.Text.UTF8Encoding($false))
)

$adminTarget = Join-Path $package 'admin'
New-Item -ItemType Directory -Path $adminTarget | Out-Null
Copy-Item -Path (Join-Path $adminBuild '*') -Destination $adminTarget -Recurse -Force

$zipPath = Join-Path $root 'hosting-package.zip'
if (Test-Path $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
}
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open(
    $zipPath,
    [System.IO.Compression.ZipArchiveMode]::Create
)
try {
    $packagePath = (Resolve-Path $package).Path.TrimEnd('\') + '\'
    Get-ChildItem -Path $package -File -Recurse -Force | ForEach-Object {
        $entryName = $_.FullName.Substring($packagePath.Length).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive,
            $_.FullName,
            $entryName,
            [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally {
    $archive.Dispose()
}

Write-Host ''
Write-Host "Upload package: $zipPath"
Write-Host 'After extraction on the hosting, edit api/config.php and set database name/user/password.'
Write-Host "One-time admin setup key: $setupKey"
Write-Host 'Import database.sql in phpMyAdmin, upload ZIP contents into public_html, then open /install.php.'
