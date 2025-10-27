# Galeria Histórica - Site de Apresentação

Este é um site para apresentação de uma galeria histórica com imagens interativas.

## 📁 Arquivos do Projeto

- `index.html` - Página principal do site
- `styles.css` - Estilos e design do site
- `script.js` - Funcionalidades interativas (modal de imagens)
- `*.png`, `*.webp` - Imagens da galeria histórica
- `server.py` - Servidor Python (opcional)
- `server.ps1` - Servidor PowerShell (opcional)

## 🚀 Como executar o site na escola

### Opção 1: Abrir diretamente no navegador (Mais Simples)
1. Extraia todos os arquivos em uma pasta
2. Clique duas vezes no arquivo `index.html`
3. O site abrirá no seu navegador padrão

### Opção 2: Usar servidor local (Recomendado para apresentações)

#### Se tiver Python instalado:
1. Abra o Prompt de Comando ou PowerShell na pasta do projeto
2. Execute: `python server.py`
3. Acesse: `http://localhost:8000`

#### Se tiver PowerShell (Windows):
1. Abra o PowerShell na pasta do projeto
2. Execute: `.\server.ps1`
3. Acesse: `http://localhost:8000`

#### Servidor simples com Python (alternativa):
1. Abra o Prompt de Comando na pasta do projeto
2. Execute: `python -m http.server 8000`
3. Acesse: `http://localhost:8000`

## ✨ Funcionalidades

- **Galeria interativa**: Clique nas imagens para vê-las em tela cheia
- **Design responsivo**: Funciona em computadores e tablets
- **Modal de imagens**: Amplie as imagens para melhor visualização
- **Footer personalizado**: Informações de direitos autorais

## 📱 Controles do Modal de Imagens

- **Abrir**: Clique em qualquer imagem da galeria
- **Fechar**: 
  - Clique no botão "X"
  - Clique fora da imagem
  - Pressione a tecla "ESC"

## 🎯 Dicas para Apresentação

1. Use a **Opção 2** (servidor local) para melhor performance
2. Teste o site antes da apresentação
3. As imagens são otimizadas para carregamento rápido
4. O modal funciona perfeitamente para destacar detalhes das imagens

---
**© 2025 Caio Girot. Todos os direitos reservados.**