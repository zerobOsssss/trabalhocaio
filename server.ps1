# Servidor HTTP simples em PowerShell
param(
    [int]$Port = 8080
)

$listener = $null

try {
    # Criar e configurar o listener
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Prefixes.Add("http://192.168.15.5:$Port/")
    
    # Iniciar o listener
    $listener.Start()
    Write-Host "Servidor iniciado em http://localhost:$Port" -ForegroundColor Green
    Write-Host "Acesse também via IP local: http://192.168.15.5:$Port" -ForegroundColor Green
    Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
    
    # Loop principal do servidor
    while ($listener.IsListening) {
        try {
            # Aguardar requisição
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            # Obter caminho do arquivo
            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/") {
                $localPath = "/index.html"
            }
            
            # Construir caminho completo do arquivo
            $filePath = Join-Path (Get-Location) $localPath.TrimStart('/')
            
            Write-Host "Requisição: $($request.HttpMethod) $localPath" -ForegroundColor Cyan
            
            if (Test-Path $filePath -PathType Leaf) {
                try {
                    # Ler arquivo
                    $content = [System.IO.File]::ReadAllBytes($filePath)
                    
                    # Definir tipo de conteúdo
                    $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                    switch ($extension) {
                        ".html" { $response.ContentType = "text/html; charset=utf-8" }
                        ".css"  { $response.ContentType = "text/css" }
                        ".js"   { $response.ContentType = "application/javascript" }
                        ".png"  { $response.ContentType = "image/png" }
                        ".jpg"  { $response.ContentType = "image/jpeg" }
                        ".jpeg" { $response.ContentType = "image/jpeg" }
                        ".gif"  { $response.ContentType = "image/gif" }
                        ".svg"  { $response.ContentType = "image/svg+xml" }
                        default { $response.ContentType = "application/octet-stream" }
                    }
                    
                    # Enviar resposta
                    $response.StatusCode = 200
                    $response.ContentLength64 = $content.Length
                    $response.OutputStream.Write($content, 0, $content.Length)
                    
                    Write-Host "Arquivo servido: $filePath ($($content.Length) bytes)" -ForegroundColor Green
                }
                catch {
                    Write-Host "Erro ao ler arquivo $filePath : $_" -ForegroundColor Red
                    $response.StatusCode = 500
                }
            }
            else {
                Write-Host "Arquivo não encontrado: $filePath" -ForegroundColor Red
                $response.StatusCode = 404
                $errorMessage = "Arquivo não encontrado: $localPath"
                $errorBytes = [System.Text.Encoding]::UTF8.GetBytes($errorMessage)
                $response.ContentLength64 = $errorBytes.Length
                $response.OutputStream.Write($errorBytes, 0, $errorBytes.Length)
            }
        }
        catch {
            Write-Host "Erro ao processar requisição: $_" -ForegroundColor Red
        }
        finally {
            try {
                if ($response) {
                    $response.Close()
                }
            }
            catch {
                # Ignorar erros ao fechar resposta
            }
        }
    }
}
catch {
    Write-Host "Erro ao iniciar servidor: $_" -ForegroundColor Red
    exit 1
}
finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        Write-Host "Servidor parado." -ForegroundColor Yellow
    }
}