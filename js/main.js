/**
 * InkMaster Studio - Tattoo Management System
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get Supabase client and utility functions from the config
    const { 
        supabase, 
        formatDate, 
        formatTime, 
        showError, 
        showSuccess, 
        lazyLoadImages 
    } = window.supabaseConfig;
    
    // Initialize components
    initNavigation();
    initLazyLoading();
    loadFeaturedArtists();
    loadRecentWork();
    loadTestimonials();
    initContactForm();
    initNewsletterForm();
    
    // Mobile navigation
    function initNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('nav ul');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('show');
                hamburger.classList.toggle('active');
            });
            
            // Close menu when clicking on a link
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navMenu.classList.remove('show');
                    hamburger.classList.remove('active');
                });
            });
        }
    }
    
    // Lazy loading images
    function initLazyLoading() {
        lazyLoadImages();
    }
    
    // Load featured artists from Supabase
    async function loadFeaturedArtists() {
        const artistsContainer = document.getElementById('featured-artists-container');
        
        if (!artistsContainer) return;
        
        try {
            const { data, error } = await supabase
                .from('artists')
                .select('*')
                .eq('featured', true)
                .limit(3);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Clear skeleton loading
                artistsContainer.innerHTML = '';
                
                // Render artists
                data.forEach(artist => {
                    const artistCard = createArtistCard(artist);
                    artistsContainer.appendChild(artistCard);
                });
            } else {
                // No featured artists found
                artistsContainer.innerHTML = '<p class="no-results">No featured artists found.</p>';
            }
        } catch (error) {
            console.error('Error loading featured artists:', error);
            artistsContainer.innerHTML = '<p class="error">Error loading artists. Please try again later.</p>';
        }
    }
    
    // Create artist card element
    function createArtistCard(artist) {
        const card = document.createElement('div');
        card.className = 'artist-card';
        
        card.innerHTML = `
            <div class="artist-image">
                <img src="${artist.profile_image || 'images/placeholder-artist.jpg'}" alt="${artist.name}" class="lazy-load">
            </div>
            <div class="artist-info">
                <h3>${artist.name}</h3>
                <p class="artist-specialty">${artist.specialty || 'Tattoo Artist'}</p>
                <p class="artist-bio">${artist.bio || 'No bio available.'}</p>
                <div class="artist-social">
                    ${artist.instagram ? `<a href="${artist.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ${artist.facebook ? `<a href="${artist.facebook}" target="_blank"><i class="fab fa-facebook-f"></i></a>` : ''}
                    ${artist.twitter ? `<a href="${artist.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                </div>
            </div>
        `;
        
        // Add click event to navigate to artist's portfolio
        card.addEventListener('click', () => {
            window.location.href = `portfolio.html?artist=${artist.id}`;
        });
        
        return card;
    }
    
    // Load recent work from Supabase
    async function loadRecentWork() {
        const galleryContainer = document.getElementById('recent-work-container');
        
        if (!galleryContainer) return;
        
        try {
            const { data, error } = await supabase
                .from('portfolio_items')
                .select('*, artists(name)')
                .order('created_at', { ascending: false })
                .limit(4);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Clear skeleton loading
                galleryContainer.innerHTML = '';
                
                // Render gallery items
                data.forEach(item => {
                    const galleryItem = createGalleryItem(item);
                    galleryContainer.appendChild(galleryItem);
                });
            } else {
                // No portfolio items found
                galleryContainer.innerHTML = '<p class="no-results">No portfolio items found.</p>';
            }
        } catch (error) {
            console.error('Error loading recent work:', error);
            galleryContainer.innerHTML = '<p class="error">Error loading gallery. Please try again later.</p>';
        }
    }
    
    // Create gallery item element
    function createGalleryItem(item) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        
        galleryItem.innerHTML = `
            <img src="${item.image_url || 'images/placeholder-tattoo.jpg'}" alt="${item.title}" class="lazy-load">
            <div class="gallery-overlay">
                <h3>${item.title}</h3>
                <p>Artist: ${item.artists?.name || 'Unknown'}</p>
            </div>
        `;
        
        // Add click event to open portfolio modal
        galleryItem.addEventListener('click', () => {
            openPortfolioModal(item);
        });
        
        return galleryItem;
    }
    
    // Open portfolio item modal
    function openPortfolioModal(item) {
        const portfolioModal = document.getElementById('portfolio-modal');
        
        if (!portfolioModal) return;
        
        // Set modal content
        document.getElementById('modal-image').src = item.image_url || 'images/placeholder-tattoo.jpg';
        document.getElementById('modal-title').textContent = item.title;
        document.getElementById('modal-artist').textContent = item.artists?.name || 'Unknown';
        document.getElementById('modal-style').textContent = item.style || 'Various';
        document.getElementById('modal-description').textContent = item.description || 'No description available.';
        
        // Show modal
        portfolioModal.style.display = 'block';
        
        // Close modal when clicking on close button
        const closeModal = portfolioModal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            portfolioModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === portfolioModal) {
                portfolioModal.style.display = 'none';
            }
        });
    }
    
    // Load testimonials from Supabase
    async function loadTestimonials() {
        const testimonialsContainer = document.getElementById('testimonials-container');
        
        if (!testimonialsContainer) return;
        
        try {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('approved', true)
                .order('created_at', { ascending: false })
                .limit(3);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Clear skeleton loading
                testimonialsContainer.innerHTML = '';
                
                // Render testimonials
                data.forEach(testimonial => {
                    const testimonialCard = createTestimonialCard(testimonial);
                    testimonialsContainer.appendChild(testimonialCard);
                });
                
                // Initialize testimonial slider
                initTestimonialSlider();
            } else {
                // No testimonials found
                testimonialsContainer.innerHTML = '<p class="no-results">No testimonials found.</p>';
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
            testimonialsContainer.innerHTML = '<p class="error">Error loading testimonials. Please try again later.</p>';
        }
    }
    
    // Create testimonial card element
    function createTestimonialCard(testimonial) {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        
        // Generate star rating
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= testimonial.rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        card.innerHTML = `
            <div class="testimonial-image">
                <img src="${testimonial.client_image || 'images/placeholder-client.jpg'}" alt="${testimonial.client_name}" class="lazy-load">
            </div>
            <div class="testimonial-rating">${stars}</div>
            <p class="testimonial-text">"${testimonial.text}"</p>
            <p class="testimonial-author">${testimonial.client_name}</p>
        `;
        
        return card;
    }
    
    // Initialize testimonial slider
    function initTestimonialSlider() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        if (testimonialCards.length <= 1) return;
        
        let currentIndex = 0;
        
        // Show only the first testimonial initially
        testimonialCards.forEach((card, index) => {
            if (index !== 0) {
                card.style.display = 'none';
            }
        });
        
        // Create navigation buttons
        const sliderNav = document.createElement('div');
        sliderNav.className = 'slider-nav';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn prev';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn next';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        sliderNav.appendChild(prevBtn);
        sliderNav.appendChild(nextBtn);
        
        document.querySelector('.testimonial-slider').appendChild(sliderNav);
        
        // Add event listeners to buttons
        prevBtn.addEventListener('click', () => {
            testimonialCards[currentIndex].style.display = 'none';
            currentIndex = (currentIndex - 1 + testimonialCards.length) % testimonialCards.length;
            testimonialCards[currentIndex].style.display = 'block';
        });
        
        nextBtn.addEventListener('click', () => {
            testimonialCards[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % testimonialCards.length;
            testimonialCards[currentIndex].style.display = 'block';
        });
        
        // Auto-rotate testimonials
        setInterval(() => {
            testimonialCards[currentIndex].style.display = 'none';
            currentIndex = (currentIndex + 1) % testimonialCards.length;
            testimonialCards[currentIndex].style.display = 'block';
        }, 5000);
    }
    
    // Initialize contact form
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            
            try {
                const { data, error } = await supabase
                    .from('contact_messages')
                    .insert([
                        {
                            name,
                            email,
                            phone,
                            message,
                            created_at: new Date().toISOString()
                        }
                    ]);
                    
                if (error) throw error;
                
                showSuccess('Message sent successfully! We will get back to you soon.', contactForm);
                contactForm.reset();
                
            } catch (error) {
                console.error('Error sending message:', error);
                showError('Error sending message. Please try again later.', contactForm);
            }
        });
    }
    
    // Initialize newsletter form
    function initNewsletterForm() {
        const newsletterForm = document.getElementById('newsletter-form');
        
        if (!newsletterForm) return;
        
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            try {
                const { data, error } = await supabase
                    .from('newsletter_subscribers')
                    .insert([
                        {
                            email,
                            subscribed_at: new Date().toISOString()
                        }
                    ]);
                    
                if (error) throw error;
                
                showSuccess('Thank you for subscribing to our newsletter!', newsletterForm);
                newsletterForm.reset();
                
            } catch (error) {
                console.error('Error subscribing to newsletter:', error);
                showError('Error subscribing to newsletter. Please try again later.', newsletterForm);
            }
        });
    }
});
