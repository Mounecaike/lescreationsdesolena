// ============================================
// CHARGEMENT ET AFFICHAGE DES CRÉATIONS
// ============================================
let currentSlide = 0;
let creationsData = [];
let isCarousel = false;

// Charger les créations depuis le JSON
async function loadCreations() {
    try {
        const response = await fetch('creations.json');
        const data = await response.json();
        creationsData = data.creations;
        
        // Décider entre carrousel et grille
        isCarousel = creationsData.length > 6;
        
        if (isCarousel) {
            renderCarousel();
        } else {
            renderGrid();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des créations:', error);
        // Afficher un message d'erreur ou un fallback
    }
}

// Créer une carte de création
function createCard(creation) {
    return `
        <div class="creation-card">
            <img src="${creation.image}" 
                 alt="${creation.nom}" 
                 class="creation-img" 
                 loading="lazy"
                 onerror="this.onerror=null; this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect width=%22400%22 height=%22300%22 fill=%22%23E8DDD4%22/><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%234A3F3A%22 font-family=%22Arial%22 font-size=%2220%22>Image non disponible</text></svg>';">
            <div class="creation-info">
                <h3>${creation.nom}</h3>
                <p>${creation.description}</p>
                <p class="platforms">📍 Disponible sur ${creation.plateformes.join(', ')}</p>
            </div>
        </div>
    `;
}

// Affichage en grille (≤ 6 items)
function renderGrid() {
    const container = document.getElementById('creations-container');
    container.innerHTML = `
        <div class="creations-grid">
            ${creationsData.map(creation => createCard(creation)).join('')}
        </div>
    `;
}

// Affichage en carrousel (> 6 items)
function renderCarousel() {
    const container = document.getElementById('creations-container');
    
    const cardsHTML = creationsData.map(creation => 
        `<div class="carousel-item">${createCard(creation)}</div>`
    ).join('');
    
    // Calculer le nombre de pages
    const itemsPerPage = getItemsPerPage();
    const totalPages = Math.ceil(creationsData.length / itemsPerPage);
    
    const dotsHTML = Array.from({ length: totalPages }, (_, i) => 
        `<button class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></button>`
    ).join('');
    
    container.innerHTML = `
        <div class="carousel-container">
            <div class="carousel-wrapper">
                <div class="carousel-track" id="carousel-track">
                    ${cardsHTML}
                </div>
            </div>
            <div class="carousel-nav">
                <button class="carousel-btn" id="prev-btn" onclick="previousSlide()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="carousel-dots" id="carousel-dots">
                    ${dotsHTML}
                </div>
                <button class="carousel-btn" id="next-btn" onclick="nextSlide()">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    updateCarousel();
}

// Obtenir le nombre d'items par page selon la largeur d'écran
function getItemsPerPage() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

// Mettre à jour l'affichage du carrousel
function updateCarousel() {
    if (!isCarousel) return;
    
    const track = document.getElementById('carousel-track');
    const itemsPerPage = getItemsPerPage();
    const totalPages = Math.ceil(creationsData.length / itemsPerPage);
    
    // Limiter currentSlide
    if (currentSlide >= totalPages) currentSlide = totalPages - 1;
    if (currentSlide < 0) currentSlide = 0;
    
    // Déplacer le carrousel
    const offset = currentSlide * 100;
    track.style.transform = `translateX(-${offset}%)`;
    
    // Mettre à jour les dots
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    
    // Mettre à jour les boutons
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalPages - 1;
}

// Navigation du carrousel
function nextSlide() {
    const itemsPerPage = getItemsPerPage();
    const totalPages = Math.ceil(creationsData.length / itemsPerPage);
    
    if (currentSlide < totalPages - 1) {
        currentSlide++;
        updateCarousel();
    }
}

function previousSlide() {
    if (currentSlide > 0) {
        currentSlide--;
        updateCarousel();
    }
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

// Recalculer lors du redimensionnement
let resizeTimeout;
window.addEventListener('resize', () => {
    if (!isCarousel) return;
    
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateCarousel();
    }, 250);
});

// Swipe mobile pour le carrousel
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('creations-container');
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', (e) => {
        if (!isCarousel) return;
        
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe gauche - slide suivant
            nextSlide();
        } else {
            // Swipe droite - slide précédent
            previousSlide();
        }
    }
}

// ============================================
// MENU BURGER MOBILE
// ============================================
function toggleMenu() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

// Fermer le menu au clic sur un lien
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('nav').classList.remove('active');
        });
    });
});

// ============================================
// FAQ ACCORDÉON
// ============================================
function toggleFAQ(button) {
    const item = button.parentElement;
    const wasActive = item.classList.contains('active');
    
    // Fermer tous les items
    document.querySelectorAll('.faq-item').forEach(faqItem => {
        faqItem.classList.remove('active');
    });
    
    // Ouvrir celui-ci s'il n'était pas déjà ouvert
    if (!wasActive) {
        item.classList.add('active');
    }
}

// ============================================
// SMOOTH SCROLL AVEC OFFSET HEADER
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// ============================================
// ANNÉE DYNAMIQUE FOOTER
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const copyrightElement = document.querySelector('.copyright');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.textContent = `© ${currentYear} Les créations de Solena - Tous droits réservés`;
    }
});

// ============================================
// ANIMATION FADE-IN AU SCROLL (IntersectionObserver)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Charger les créations depuis le JSON
    loadCreations();
    
    // Sélectionner les éléments à animer
    const fadeElements = document.querySelectorAll('.pillar, .platform-btn, .faq-item');
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
    });

    // Observer les éléments
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// LAZY LOADING IMAGES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
        // Le navigateur supporte le lazy loading natif
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback pour navigateurs plus anciens
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
});