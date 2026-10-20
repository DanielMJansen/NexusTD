# Gera o .zip para enviar ao itch.io (jogo HTML): build + conteúdo de dist/ na raiz do zip (index.html no topo).
# Uso: npm run release:itch  ->  release/nexus-td-<versão>-itch.zip (pasta ignorada pelo git).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { throw 'O build falhou: nada foi empacotado.' }
  $version = (Select-String -Path 'src/data/config.ts' -Pattern "GAME_VERSION\s*=\s*'([^']+)'").Matches[0].Groups[1].Value
  New-Item -ItemType Directory -Force 'release' | Out-Null
  $zip = Join-Path $root "release\nexus-td-$version-itch.zip"
  if (Test-Path $zip) { Remove-Item $zip -Force }
  # zip montado à mão: o Compress-Archive do PowerShell 5.1 grava "assets\x.js" (barra invertida), que o
  # servidor do itch.io (Linux) não reconhece como pasta, e o jogo abriria em branco
  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $dist = (Resolve-Path 'dist').Path
  $archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
  try {
    foreach ($file in Get-ChildItem $dist -Recurse -File) {
      $entry = $file.FullName.Substring($dist.Length + 1).Replace('\', '/')
      [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entry, 'Optimal')
    }
  } finally {
    $archive.Dispose()
  }
  $size = (Get-Item $zip).Length / 1KB
  Write-Output ("Pronto: {0} ({1:N0} KB)" -f $zip, $size)
} finally {
  Pop-Location
}
