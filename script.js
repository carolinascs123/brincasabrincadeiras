
document.addEventListener('DOMContentLoaded', () => {

    // --- Original Site Logic ---

    // Tubelight Navbar Logic
    const tubelightItems = document.querySelectorAll('.tubelight-item');
    const lampTemplate = `
        <div class="lamp-effect">
            <div class="lamp-line"></div>
            <div class="lamp-glow-1"></div>
            <div class="lamp-glow-2"></div>
            <div class="lamp-glow-3"></div>
        </div>
    `;

    tubelightItems.forEach(item => {
        if (!item.querySelector('.lamp-effect')) {
            item.insertAdjacentHTML('beforeend', lampTemplate);
        }
    });

    tubelightItems.forEach(item => {
        item.addEventListener('click', function (e) {
            tubelightItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-1');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    animatedElements.forEach(el => observer.observe(el));

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Hero Text Animation
    const words = document.querySelectorAll('.dynamic-word');
    let currentIndex = 0;

    if (words.length > 0) {
        words.forEach((word, index) => {
            if (index === 0) word.classList.add('active');
            else word.classList.remove('active', 'passed');
        });

        let nextIndex = 1;
        setInterval(() => {
            words.forEach((word, index) => {
                if (index === nextIndex) {
                    word.classList.add('active');
                    word.classList.remove('passed');
                } else if (nextIndex > index) {
                    word.classList.add('passed');
                    word.classList.remove('active');
                } else {
                    word.classList.remove('active', 'passed');
                }
            });
            nextIndex = (nextIndex + 1) % words.length;
        }, 2000);
    }

    // --- Testimonial Carousel with Swipe/Drag ---
    const testimonials = [
        { id: 1, name: "Aniversário", description: "As pinturas da Carolina eram um momento muito esperado pela minha filha. A oferta de desenhos é óptima, os miúdos ficaram empolgados e o resultado foi bestial! Ficaram lindos!" },
        { id: 2, name: "Aniversário", description: "As pinturas foram um sucesso e as crianças divertiram-se imenso com os jogos tradicionais, para além do entusiasmo no final com os balões!" },
        { id: 3, name: "Aniversário", description: "We loved having Margarida who painted the kids (and some parents!) faces with so much attention and fun. Would definitely recommend for a party!" }
    ];

    const carouselContainer = document.getElementById('testimonial-carousel');
    let currentTestimonialIndex = 0;

    // Variáveis para o sistema de arrastar
    let startX = 0;
    let isDragging = false;

    function renderTestimonials() {
        if (!carouselContainer) return;
        carouselContainer.innerHTML = '';

        testimonials.forEach((testimonial, index) => {
            let positionClass = '';
            // Lógica simples de visibilidade: mostra o atual, o próximo e o anterior
            if (index === currentTestimonialIndex) positionClass = 'active';
            else if (index === (currentTestimonialIndex + 1) % testimonials.length) positionClass = 'next';
            else positionClass = 'prev';

            const card = document.createElement('div');
            card.className = `testimonial-card ${positionClass}`;
            card.innerHTML = `
                <div class="testimonial-icon"><i class="fas fa-quote-left"></i></div>
                <h3 class="user-name">${testimonial.name}</h3>
                <p class="user-review">"${testimonial.description}"</p>
            `;

            // Adiciona os eventos de arrastar apenas ao card ativo
            if (positionClass === 'active') {
                addDragEvents(card);
            }

            carouselContainer.appendChild(card);
        });
    }

    function addDragEvents(card) {
        // Eventos de Touch (Telemóvel)
        card.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX));
        card.addEventListener('touchmove', (e) => onDrag(e.touches[0].clientX, card));
        card.addEventListener('touchend', (e) => endDrag());

        // Eventos de Mouse (Desktop)
        card.addEventListener('mousedown', (e) => startDrag(e.clientX));
        const handleMouseMove = (e) => { if (isDragging) onDrag(e.clientX, card) };
        const handleMouseUp = () => {
            if (isDragging) {
                endDrag();
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    function startDrag(x) {
        startX = x;
        isDragging = true;
    }

    function onDrag(currentX, card) {
        const diff = currentX - startX;
        // Move o card visualmente enquanto arrasta
        card.style.transform = `translateX(${diff}px) rotate(${diff / 20}deg)`;
        card.style.cursor = 'grabbing';
    }

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;

        const card = carouselContainer.querySelector('.testimonial-card.active');
        if (!card) return;

        // Pegamos na posição final do card
        const style = window.getComputedStyle(card);
        const matrix = new WebKitCSSMatrix(style.transform);
        const transformX = matrix.m41;

        // Se arrastou mais de 10px para qualquer lado, muda o testemunho
        if (Math.abs(transformX) > 10) {
            if (transformX > 0) {
                // Arrastou para a direita (anterior)
                currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
            } else {
                // Arrastou para a esquerda (próximo)
                currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            }
        }

        // Reseta o estilo e renderiza de novo
        card.style.transform = '';
        renderTestimonials();
    }

    function nextTestimonial() {
        // Só muda automaticamente se o utilizador não estiver a interagir
        if (!isDragging) {
            currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
            renderTestimonials();
        }
    }

    renderTestimonials();
    setInterval(nextTestimonial, 5000);


    // Magic Sparkle Cursor
    const sparkleConfig = {
        starAnimationDuration: 1500,
        minimumTimeBetweenStars: 250,
        minimumDistanceBetweenStars: 75,
        colors: ["249 146 253", "252 254 255"],
        sizes: ["1.4rem", "1rem", "0.6rem"],
        animations: ["fall-1", "fall-2", "fall-3"]
    };

    let lastStarTimestamp = Date.now();
    let lastStarPosition = { x: 0, y: 0 };
    let starCount = 0;

    const mouseFollower = document.querySelector('.mouse-follower');
    let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
    const lerpFactor = 0.15;

    const sparkleSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%; height:100%;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;

    function createStar(position) {
        const star = document.createElement("div");
        const color = sparkleConfig.colors[Math.floor(Math.random() * sparkleConfig.colors.length)];
        star.className = "mouse-sparkles-star";
        star.style.left = `${position.x}px`;
        star.style.top = `${position.y}px`;
        star.style.fontSize = sparkleConfig.sizes[Math.floor(Math.random() * sparkleConfig.sizes.length)];
        star.style.color = `rgb(${color})`;
        star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
        star.style.animationName = sparkleConfig.animations[starCount++ % 3];
        star.style.animationDuration = `${sparkleConfig.starAnimationDuration}ms`;
        star.innerHTML = sparkleSVG;
        document.body.appendChild(star);
        setTimeout(() => star.remove(), sparkleConfig.starAnimationDuration);
    }

    function handleOnMove(e) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        if (x === undefined || y === undefined) return;
        targetX = x - 16; targetY = y - 16;
        const now = Date.now();
        const dist = Math.sqrt(Math.pow(x - lastStarPosition.x, 2) + Math.pow(y - lastStarPosition.y, 2));
        if (dist >= sparkleConfig.minimumDistanceBetweenStars || now - lastStarTimestamp > sparkleConfig.minimumTimeBetweenStars) {
            createStar({ x, y });
            lastStarTimestamp = now; lastStarPosition = { x, y };
        }
    }

    function updateFollower() {
        currentX += (targetX - currentX) * lerpFactor;
        currentY += (targetY - currentY) * lerpFactor;
        if (mouseFollower) mouseFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(updateFollower);
    }

    updateFollower();
    window.addEventListener("mousemove", handleOnMove);
    window.addEventListener("touchmove", (e) => handleOnMove(e.touches[0]));

    // Contact Form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = this.querySelector('.btn-gradient-wrapper');
            const submitText = submitBtn ? submitBtn.querySelector('.btn-inner') : null;
            if (submitText) submitText.innerHTML = 'A enviar... <i class="fas fa-spinner fa-spin"></i>';
            const data = new FormData(this);
            try {
                const response = await fetch(this.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    contactForm.innerHTML = `<div class="form-success-message reveal-scale opacity-1"><div class="success-icon"><i class="fas fa-check-circle"></i></div><h3>Pedido Enviado!</h3><p>Obrigado pelo seu contacto. Entraremos em contacto consigo o mais breve possível.</p><button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">Enviar outro pedido</button></div>`;
                } else { throw new Error('Erro ao enviar'); }
            } catch (error) {
                if (submitText) submitText.innerHTML = 'Erro ao enviar <i class="fas fa-exclamation-triangle"></i>';
                alert('Ocorreu um erro ao enviar o pedido.');
            }
        });
    }

    // --- Interactive Bento Gallery Logic ---
    const mediaItems = [
        { id: 1, type: 'image', url: 'assets/images/animacao23.png', span: 'span-2x2', category: 'animacao' },
        { id: 2, type: 'image', url: 'assets/images/animacao3.jpg', span: 'span-2x1', category: 'pinturas' },
        { id: 3, type: 'image', url: 'assets/images/animacao4.jpg', span: 'span-1x2', category: 'animacao' },
        { id: 4, type: 'image', url: 'assets/images/animacao21.png', span: 'span-1x1', category: 'pinturas' },
        { id: 5, type: 'image', url: 'assets/images/animacao11.jpg', span: 'span-1x1', category: 'pinturas' },
        { id: 6, type: 'image', url: 'assets/images/animacao22.png', span: 'span-1x1', category: 'pinturas' },
    ];

    const bentoContainer = document.getElementById('bento-gallery');
    const galleryModal = document.getElementById('gallery-modal');
    const modalMediaDisplay = document.getElementById('modal-media-display');
    const modalDock = document.getElementById('modal-dock');
    const modalClose = document.getElementById('modal-close');
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentItem = null;

    function renderBentoGrid(filter = 'all') {
        if (!bentoContainer) return;
        bentoContainer.innerHTML = '';

        const filteredItems = filter === 'all'
            ? mediaItems
            : mediaItems.filter(item => item.category === filter);

        filteredItems.forEach(item => {
            const el = document.createElement('div');
            el.className = `bento-item ${item.span} reveal-up`;

            if (item.type === 'placeholder') {
                el.innerHTML = `
                    <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.1); border-radius:inherit;">
                        <span style="font-size:0.8rem; opacity:0.5;">${item.url}</span>
                    </div>
                    <div class="bento-overlay"></div>`;
            } else {
                el.innerHTML = item.type === 'video'
                    ? `<video src="${item.url}" muted loop playsinline preload="auto"></video><div class="bento-overlay"></div>`
                    : `<img src="${item.url}" alt="Portfolio" loading="lazy"><div class="bento-overlay"></div>`;
                el.addEventListener('click', () => openModal(item));
            }

            bentoContainer.appendChild(el);
            observer.observe(el);
        });
    }

    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderBentoGrid(btn.dataset.filter);
            });
        });
    }

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.play().catch(() => { });
            else entry.target.pause();
        });
    }, { threshold: 0.5 });

    function openModal(item) {
        currentItem = item;
        updateModalContent();
        renderDock();
        galleryModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        galleryModal.classList.remove('active');
        document.body.style.overflow = '';
        modalMediaDisplay.innerHTML = '';
    }

    function updateModalContent() {
        modalMediaDisplay.innerHTML = '';
        const media = currentItem.type === 'video' ? document.createElement('video') : document.createElement('img');
        media.src = currentItem.url;
        if (currentItem.type === 'video') { media.autoplay = true; media.controls = true; media.loop = true; }
        modalMediaDisplay.appendChild(media);
    }

    function renderDock() {
        modalDock.innerHTML = '';
        mediaItems.forEach(item => {
            const dockItem = document.createElement('div');
            dockItem.className = `dock-item ${currentItem.id === item.id ? 'active' : ''}`;
            dockItem.innerHTML = item.type === 'video' ? `<video src="${item.url}" muted></video>` : `<img src="${item.url}">`;
            dockItem.addEventListener('click', () => { currentItem = item; updateModalContent(); renderDock(); });
            modalDock.appendChild(dockItem);
        });
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (galleryModal) galleryModal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

    renderBentoGrid();
    document.querySelectorAll('.bento-item video').forEach(v => videoObserver.observe(v));

    // --- Refined Horizontal Draggable Gallery V2 ---
    function initHorizontalBento() {
        const containers = document.querySelectorAll('.horizontal-bento-container');

        containers.forEach(container => {
            const grid = container.querySelector('.horizontal-bento-grid');
            if (!grid) return;

            let isDown = false;
            let startX;
            let currentTranslate = 0;
            let dragElastic = 0.05; // Matching React design

            const slider = document.getElementById('gallery-range');
            const sliderProgress = document.getElementById('slider-progress');

            const updateSlider = () => {
                const containerWidth = container.offsetWidth;
                const gridWidth = grid.scrollWidth;
                const minX = Math.min(0, containerWidth - gridWidth - 64);
                if (minX >= 0) {
                    if (slider) slider.parentElement.parentElement.style.display = 'none';
                    return;
                }

                if (slider) {
                    const progress = (currentTranslate / minX) * 100;
                    slider.value = progress;
                    if (sliderProgress) sliderProgress.style.width = `${progress}%`;
                }
            };

            const handleStart = (e) => {
                isDown = true;
                container.style.cursor = 'grabbing';
                const pageX = e.pageX || (e.touches && e.touches[0].pageX);
                startX = pageX - currentTranslate;
            };

            const handleEnd = () => {
                isDown = false;
                container.style.cursor = 'grab';
            };

            const handleMove = (e) => {
                if (!isDown) return;
                const pageX = e.pageX || (e.touches && e.touches[0].pageX);
                let x = pageX - startX;

                const containerWidth = container.offsetWidth;
                const gridWidth = grid.scrollWidth;
                const minX = Math.min(0, containerWidth - gridWidth - 64); // Padding

                // Elastic effect at bounds
                if (x > 0) x *= dragElastic;
                else if (x < minX) x = minX + (x - minX) * dragElastic;

                currentTranslate = x;
                grid.style.transform = `translateX(${currentTranslate}px)`;
                updateSlider();
            };

            if (slider) {
                slider.addEventListener('input', (e) => {
                    const val = e.target.value;
                    const containerWidth = container.offsetWidth;
                    const gridWidth = grid.scrollWidth;
                    const minX = Math.min(0, containerWidth - gridWidth - 64);

                    currentTranslate = (val / 100) * minX;
                    grid.style.transform = `translateX(${currentTranslate}px)`;
                    if (sliderProgress) sliderProgress.style.width = `${val}%`;
                });
            }

            // Initial check
            updateSlider();

            container.addEventListener('mousedown', handleStart);
            container.addEventListener('touchstart', handleStart, { passive: true });
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchend', handleEnd);
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('touchmove', handleMove, { passive: false });
        });
    }

    // Scroll-driven Header Animations (Framer Motion style)
    function initScrollAnimations() {
        const headers = document.querySelectorAll('.service-header .container');
        window.addEventListener('scroll', () => {
            headers.forEach(header => {
                const rect = header.getBoundingClientRect();
                const viewHeight = window.innerHeight;

                // Simple calculation for opacity and Y transform based on scroll
                // [0, 0.2, 0.8, 1] -> [0, 1, 1, 0]
                const scrollProgress = 1 - (rect.top / viewHeight);
                let opacity = 0;
                let translateY = 30;

                if (scrollProgress > 0 && scrollProgress < 0.2) {
                    opacity = scrollProgress / 0.2;
                    translateY = 30 * (1 - opacity);
                } else if (scrollProgress >= 0.2 && scrollProgress <= 0.8) {
                    opacity = 1;
                    translateY = 0;
                } else if (scrollProgress > 0.8 && scrollProgress < 1) {
                    opacity = 1 - (scrollProgress - 0.8) / 0.2;
                    translateY = 0;
                }

                header.style.opacity = opacity;
                header.style.transform = `translateY(${translateY}px)`;
            });
        });
    }

    function initServiceModals() {
        const hbarItems = document.querySelectorAll('.hbar-item');
        hbarItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const video = item.querySelector('video');
                if (img) openModal({ type: 'image', url: img.src });
                else if (video) openModal({ type: 'video', url: video.src });
            });
        });
    }

    initHorizontalBento();
    initScrollAnimations();
    initServiceModals();

});
