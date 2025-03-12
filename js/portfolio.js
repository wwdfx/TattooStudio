/**
 * V.SHAI TATTOO - Tattoo Management System
 * Portfolio Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get Supabase client and utility functions from the config
    const { 
        supabase, 
        formatDate, 
        showError, 
        lazyLoadImages 
    } = window.supabaseConfig;
    
    // Initialize components
    initFilters();
    loadPortfolioItems();
    initPortfolioModal();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artist');
    const styleFilter = urlParams.get('style');
    
    // Initialize filters
    async function initFilters() {
        // Load artists for filter dropdown
        const artistFilter = document.getElementById('artist-filter');
        
        if (artistFilter) {
            try {
                const { data, error } = await supabase
                    .from('artists')
                    .select('id, name')
                    .order('name');
                    
                if (error) throw error;
                
                if (data && data.length > 0) {
                    // Add artists to dropdown
                    data.forEach(artist => {
                        const option = document.createElement('option');
                        option.value = artist.id;
                        option.textContent = artist.name;
                        
                        // Select artist if it matches URL parameter
                        if (artistId && artist.id.toString() === artistId) {
                            option.selected = true;
                        }
                        
                        artistFilter.appendChild(option);
                    });
                }
            } catch (error) {
                console.error('Error loading artists for filter:', error);
            }
        }
        
        // Set style filter from URL parameter
        const styleFilterSelect = document.getElementById('style-filter');
        if (styleFilterSelect && styleFilter) {
            const option = Array.from(styleFilterSelect.options).find(opt => opt.value === styleFilter);
            if (option) {
                option.selected = true;
            }
        }
        
        // Add event listeners to filters
        const filters = document.querySelectorAll('#style-filter, #artist-filter');
        const searchFilter = document.getElementById('search-filter');
        
        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                loadPortfolioItems(1); // Reset to page 1 when filter changes
            });
        });
        
        if (searchFilter) {
            // Debounce search input
            let debounceTimeout;
            searchFilter.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    loadPortfolioItems(1); // Reset to page 1 when search changes
                }, 300);
            });
        }
    }
    
    // Load portfolio items from Supabase
    async function loadPortfolioItems(page = 1) {
        const portfolioContainer = document.getElementById('portfolio-container');
        const paginationContainer = document.getElementById('portfolio-pagination');
        
        if (!portfolioContainer) return;
        
        // Get filter values
        const styleFilter = document.getElementById('style-filter')?.value || 'all';
        const artistFilter = document.getElementById('artist-filter')?.value || 'all';
        const searchFilter = document.getElementById('search-filter')?.value || '';
        
        // Items per page
        const itemsPerPage = 8;
        const from = (page - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;
        
        try {
            // Build query
            let query = supabase
                .from('portfolio_items')
                .select('*, artists(id, name)', { count: 'exact' });
            
            // Apply filters
            if (styleFilter !== 'all') {
                query = query.eq('style', styleFilter);
            }
            
            if (artistFilter !== 'all') {
                query = query.eq('artist_id', artistFilter);
            }
            
            if (searchFilter) {
                query = query.or(`title.ilike.%${searchFilter}%,description.ilike.%${searchFilter}%`);
            }
            
            // Get paginated results
            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Clear skeleton loading
                portfolioContainer.innerHTML = '';
                
                // Render portfolio items
                data.forEach(item => {
                    const portfolioItem = createPortfolioItem(item);
                    portfolioContainer.appendChild(portfolioItem);
                });
                
                // Update pagination
                if (paginationContainer) {
                    updatePagination(page, Math.ceil(count / itemsPerPage));
                }
            } else {
                // No portfolio items found
                portfolioContainer.innerHTML = '<p class="no-results">No portfolio items found matching your criteria.</p>';
                
                // Clear pagination
                if (paginationContainer) {
                    paginationContainer.innerHTML = '';
                }
            }
            
            // Initialize lazy loading for new images
            lazyLoadImages();
            
        } catch (error) {
            console.error('Error loading portfolio items:', error);
            portfolioContainer.innerHTML = '<p class="error">Error loading portfolio. Please try again later.</p>';
        }
    }
    
    // Create portfolio item element
    function createPortfolioItem(item) {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'gallery-item';
        
        portfolioItem.innerHTML = `
            <img src="${item.image_url || 'images/placeholder-tattoo.jpg'}" alt="${item.title}" class="lazy-load" data-src="${item.image_url || 'images/placeholder-tattoo.jpg'}">
            <div class="gallery-overlay">
                <h3>${item.title}</h3>
                <p>Artist: ${item.artists?.name || 'Unknown'}</p>
            </div>
        `;
        
        // Add click event to open portfolio modal
        portfolioItem.addEventListener('click', () => {
            openPortfolioModal(item);
        });
        
        return portfolioItem;
    }
    
    // Update pagination controls
    function updatePagination(currentPage, totalPages) {
        const paginationContainer = document.getElementById('portfolio-pagination');
        
        if (!paginationContainer) return;
        
        // Clear existing pagination
        const paginationNumbers = paginationContainer.querySelector('.pagination-numbers');
        paginationNumbers.innerHTML = '';
        
        // Previous button
        const prevButton = paginationContainer.querySelector('.pagination-btn:first-child');
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => loadPortfolioItems(currentPage - 1);
        
        // Next button
        const nextButton = paginationContainer.querySelector('.pagination-btn:last-child');
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => loadPortfolioItems(currentPage + 1);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Add first page if not visible
        if (startPage > 1) {
            addPageNumber(1);
            if (startPage > 2) {
                addEllipsis();
            }
        }
        
        // Add visible page numbers
        for (let i = startPage; i <= endPage; i++) {
            addPageNumber(i);
        }
        
        // Add last page if not visible
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                addEllipsis();
            }
            addPageNumber(totalPages);
        }
        
        // Helper function to add page number
        function addPageNumber(pageNum) {
            const pageElement = document.createElement('span');
            pageElement.className = `pagination-number${pageNum === currentPage ? ' active' : ''}`;
            pageElement.textContent = pageNum;
            pageElement.onclick = () => loadPortfolioItems(pageNum);
            paginationNumbers.appendChild(pageElement);
        }
        
        // Helper function to add ellipsis
        function addEllipsis() {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            paginationNumbers.appendChild(ellipsis);
        }
    }
    
    // Initialize portfolio modal
    function initPortfolioModal() {
        const portfolioModal = document.getElementById('portfolio-modal');
        
        if (!portfolioModal) return;
        
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
        
        // Update booking link to pre-select the artist
        const bookingLink = portfolioModal.querySelector('.modal-actions a');
        if (bookingLink && item.artists?.id) {
            bookingLink.href = `booking.html?artist=${item.artists.id}`;
        }
        
        // Show modal
        portfolioModal.style.display = 'block';
    }
});
