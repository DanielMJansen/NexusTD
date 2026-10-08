# Encerra processos que ficaram rodando do projeto (bot de calibragem, servidor do Vite, esbuild,
# shells do Git e o Edge de testes). Não mexe no VS Code nem em outros programas.
# Uso: npm run stop   (ou: powershell -ExecutionPolicy Bypass -File scripts/stop.ps1)

$procs = Get-CimInstance Win32_Process | Where-Object {
  ($_.Name -eq 'node.exe' -and $_.CommandLine -match 'calib|vite|npx-cli|\.cache\\|\.cache/') -or
  ($_.Name -eq 'esbuild.exe' -and $_.CommandLine -match 'Nexus') -or
  ($_.Name -in @('sh.exe', 'xargs.exe', 'bash.exe') -and $_.CommandLine -match 'calib|matrix|vite|npx') -or
  ($_.Name -eq 'msedge.exe' -and $_.CommandLine -match 'edge-profile')
}
# não encerra o próprio comando que está rodando este script
$procs = $procs | Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -notmatch 'stop\.ps1' }

if (-not $procs) {
  Write-Output 'Nada rodando.'
  exit 0
}
foreach ($p in $procs) {
  try { Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop } catch {}
}
Write-Output "Encerrados $(@($procs).Count) processos."
