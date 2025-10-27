// Inicialização das animações AOS
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
});

// Smooth scrolling para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Efeito parallax no hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    if (hero && heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - scrolled / window.innerHeight;
    }
});

// Animação do header ao fazer scroll
let lastScrollTop = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        header.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Lazy loading das imagens
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('.gallery-image');
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(entry.target);
                }
            }
        });
    });

    document.querySelectorAll('.gallery-item').forEach(item => {
        imageObserver.observe(item);
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Scroll suave para o botão CTA
document.querySelector('.cta-button')?.addEventListener('click', function() {
    document.querySelector('#gallery').scrollIntoView({
        behavior: 'smooth'
    });
});

// Preloader (opcional)
window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
});

console.log('🎨 Landing Page carregada com sucesso! Pronta para receber as histórias das imagens.');

// ========================================
// MODAL DE IMAGENS - VERSÃO SIMPLIFICADA E FUNCIONAL
// ========================================

// Aguardar DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando modal...');
    
    // Elementos do modal
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const caption = document.getElementById('caption');
    const closeBtn = document.querySelector('.close');
    
    console.log('Modal encontrado:', !!modal);
    console.log('ModalImg encontrado:', !!modalImg);
    console.log('Caption encontrado:', !!caption);
    console.log('CloseBtn encontrado:', !!closeBtn);
    
    if (!modal || !modalImg || !caption) {
        console.error('❌ Elementos do modal não encontrados!');
        return;
    }
    
    // Função para abrir modal - VERSÃO SIMPLIFICADA
    function abrirModal(imagemSrc, imagemAlt) {
        console.log('📸 Tentando abrir modal para:', imagemSrc);
        
        // Limpar primeiro
        modalImg.src = '';
        modalImg.style.display = 'none';
        
        // Aguardar um pouco e definir imagem
        setTimeout(() => {
            modalImg.src = imagemSrc;
            modalImg.alt = imagemAlt || 'Imagem em tela cheia';
            caption.textContent = imagemAlt || 'Imagem em tela cheia';
            
            // Mostrar imagem quando carregar
            modalImg.onload = function() {
                console.log('✅ Imagem carregada:', this.src);
                this.style.display = 'block';
            };
            
            modalImg.onerror = function() {
                console.error('❌ Erro ao carregar imagem:', imagemSrc);
                this.alt = 'Erro ao carregar imagem';
                caption.textContent = 'Erro ao carregar imagem';
            };
            
            // Mostrar modal
            modal.style.display = 'flex';
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            console.log('✅ Modal aberto!');
        }, 100);
    }
    
    // Função para fechar modal
    function fecharModal() {
        console.log('🔒 Fechando modal...');
        
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        
        // Limpar imagem
        modalImg.src = '';
        modalImg.style.display = 'none';
        caption.textContent = '';
        
        console.log('✅ Modal fechado!');
    }
    
    // Configurar cliques nas imagens da galeria
    const imagens = document.querySelectorAll('.gallery-image');
    console.log('🖼️ Imagens encontradas:', imagens.length);
    
    imagens.forEach((img, index) => {
        console.log(`Configurando imagem ${index + 1}: ${img.src}`);
        
        // Garantir que a imagem é clicável
        img.style.cursor = 'pointer';
        img.title = 'Clique para ver em tela cheia';
        
        // Event listener simples
        img.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('🖱️ CLIQUE na imagem:', this.src);
            abrirModal(this.src, this.alt);
        });
        
        // Backup onclick
        img.onclick = function(event) {
            event.preventDefault();
            console.log('🖱️ ONCLICK na imagem:', this.src);
            abrirModal(this.src, this.alt);
            return false;
        };
    });
    
    // Event listeners para fechar modal
    if (closeBtn) {
        closeBtn.addEventListener('click', fecharModal);
        closeBtn.onclick = fecharModal;
    }
    
    // Fechar ao clicar no fundo do modal
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    });
    
    // Fechar com tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            fecharModal();
        }
    });
    
    console.log('✅ Modal configurado com sucesso!');
});

// Backup: window.load
window.addEventListener('load', function() {
    console.log('🔄 Backup: window.load executado');
    
    // Verificar se elementos existem
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const imagens = document.querySelectorAll('.gallery-image');
    
    console.log('Backup - Modal:', !!modal);
    console.log('Backup - ModalImg:', !!modalImg);
    console.log('Backup - Imagens:', imagens.length);
    
    if (modal && modalImg && imagens.length > 0) {
        console.log('✅ Backup: Todos os elementos encontrados');
    } else {
        console.error('❌ Backup: Elementos não encontrados');
    }
});