# Matriz completa da calibragem (CAL): 5 fases × 2 perfis de talento (2.500 ✦ e árvore completa), 30 runs por raça.
# Roda em sequência e salva um relatório por combinação em calib-results/<data>/ (pasta ignorada pelo git).
# Uso: npm run calib:matrix   (deixe o PC livre; leva ~3 h). Para parar: npm run stop.
# Opcional: $env:N = 10 para uma rodada rápida de teste.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root ("calib-results\" + (Get-Date -Format 'yyyy-MM-dd_HH-mm'))
New-Item -ItemType Directory -Force $out | Out-Null

# compila o bot uma vez (o npm run calib recompila a cada chamada)
Push-Location $root
npx esbuild scripts/calib.ts --bundle --platform=node --format=esm --outfile=node_modules/.cache/calib.mjs --log-level=warning
Pop-Location

$stages = 'graveyard', 'swamp', 'tundra', 'desert', 'citadel'
$talents = '2500', 'max'
$total = $stages.Count * $talents.Count
$i = 0
$start = Get-Date
foreach ($stage in $stages) {
  foreach ($tal in $talents) {
    $i++
    $file = Join-Path $out "$stage-$tal.txt"
    Write-Output ("[{0}/{1}] {2} - talentos {3} -> {4}" -f $i, $total, $stage, $tal, $file)
    $env:STAGE = $stage
    $env:TAL = $tal
    node (Join-Path $root 'node_modules\.cache\calib.mjs') | Out-File -Encoding utf8 $file
  }
}
Write-Output ("Pronto em {0:N0} min. Resultados em {1}" -f ((Get-Date) - $start).TotalMinutes, $out)
