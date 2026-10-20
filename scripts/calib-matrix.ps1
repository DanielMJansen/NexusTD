# Matriz completa da calibragem (CAL): 5 fases x 2 perfis de talento (2.500 e arvore completa), 30 runs por raca.
# As 10 combinacoes rodam em paralelo (um processo por nucleo, prioridade baixa) e cada uma salva um
# relatorio em calib-results/<data>/ (pasta ignorada pelo git).
# Uso: npm run calib:matrix. Para parar: npm run stop.
# Opcional: $env:N = 10 (rodada rapida) e $env:PAR = 4 (quantas combinacoes ao mesmo tempo; padrao: todas).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root ("calib-results\" + (Get-Date -Format 'yyyy-MM-dd_HH-mm'))
New-Item -ItemType Directory -Force $out | Out-Null

# compila o bot uma vez (o npm run calib recompila a cada chamada)
Push-Location $root
npx esbuild scripts/calib.ts --bundle --platform=node --format=esm --outfile=node_modules/.cache/calib.mjs --log-level=warning
Pop-Location
$bot = Join-Path $root 'node_modules\.cache\calib.mjs'

$jobs = foreach ($stage in 'graveyard', 'swamp', 'tundra', 'desert', 'citadel') {
  foreach ($tal in '2500', 'max') { [pscustomobject]@{ Stage = $stage; Tal = $tal } }
}
$par = if ($env:PAR) { [int]$env:PAR } else { $jobs.Count }
$start = Get-Date
$running = @()
$done = 0

function Wait-One {
  # espera algum processo terminar e avisa qual foi
  while ($true) {
    foreach ($r in $script:running) {
      if ($r.Process.HasExited) {
        $script:running = @($script:running | Where-Object { $_ -ne $r })
        $script:done++
        Write-Output ("[{0}/{1}] pronto: {2} - talentos {3} ({4:N0} min)" -f $script:done, $jobs.Count, $r.Stage, $r.Tal, ((Get-Date) - $start).TotalMinutes)
        return
      }
    }
    Start-Sleep -Seconds 2
  }
}

foreach ($job in $jobs) {
  while ($running.Count -ge $par) { Wait-One }
  $env:STAGE = $job.Stage
  $env:TAL = $job.Tal
  $file = Join-Path $out ("{0}-{1}.txt" -f $job.Stage, $job.Tal)
  $p = Start-Process -FilePath 'node' -ArgumentList "`"$bot`"" -NoNewWindow -PassThru `
    -RedirectStandardOutput $file -RedirectStandardError "$file.err"
  try { $p.PriorityClass = 'BelowNormal' } catch {}
  $running += [pscustomobject]@{ Process = $p; Stage = $job.Stage; Tal = $job.Tal }
  Write-Output ("iniciado: {0} - talentos {1}" -f $job.Stage, $job.Tal)
}
while ($running.Count -gt 0) { Wait-One }

# erros vazios nao precisam ficar na pasta
Get-ChildItem $out -Filter '*.err' | Where-Object { $_.Length -eq 0 } | Remove-Item
Write-Output ("Pronto em {0:N0} min. Resultados em {1}" -f ((Get-Date) - $start).TotalMinutes, $out)
