#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

# Definir a porta
PORT = 8080

# Mudar para o diretório do script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Adicionar headers CORS para evitar problemas
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Log personalizado para mostrar requisições
        print(f"[{self.address_string()}] {format % args}")

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Servidor rodando em http://localhost:{PORT}")
        print("Pressione Ctrl+C para parar o servidor")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServidor parado.")
except Exception as e:
    print(f"Erro ao iniciar servidor: {e}")
    sys.exit(1)