#!/usr/bin/env python3
import http.server
import socketserver
import os
import socket

# Configurações
PORT = 8080

# Obter IP local
def get_local_ip():
    try:
        # Conectar a um endereço externo para descobrir o IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "192.168.15.5"  # IP padrão baseado no ipconfig

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar headers CORS para permitir acesso de qualquer origem
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    def guess_type(self, path):
        # Definir tipos MIME corretos
        if path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.png'):
            return 'image/png'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            return 'image/jpeg'
        elif path.endswith('.html'):
            return 'text/html; charset=utf-8'
        return super().guess_type(path)

if __name__ == "__main__":
    # Mudar para o diretório do projeto
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Obter IP local
    local_ip = get_local_ip()
    
    # Configurar servidor
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🌐 Servidor iniciado!")
        print(f"📱 Acesso local: http://localhost:{PORT}")
        print(f"📱 Acesso pelo celular: http://{local_ip}:{PORT}")
        print(f"🔄 Pressione Ctrl+C para parar")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado!")