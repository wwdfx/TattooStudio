/**
 * InkMaster Studio - Tattoo Management System
 * Booking Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get Supabase client and utility functions from the config
    const { 
        supabase, 
        checkAuth,
        formatDate, 
        formatTime,
        generateId,
        showError, 
        showSuccess,
        lazyLoadImages 
    } = window.supabaseConfig;
    
    // Initialize components
    initBookingSteps();
    loadArtists();
    initServiceSelection();
    initDatePicker();
    initReferenceImages();
    initTermsModal();
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const artistId = urlParams.get('artist');
    
    // Booking data object to store all selections
    const bookingData = {
        artist: null,
        service: null,
        customDescription: '',
        date: null,
        time: null,
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        tattooDescription: '',
        referenceImages: [],
        isFirstTattoo: false
    };
    
    // Initialize booking steps navigation
    function initBookingSteps() {
        const steps = document.querySelectorAll('.booking-step');
        const forms = document.querySelectorAll('.booking-form');
        
        // Next buttons
        document.getElementById('step-1-next').addEventListener('click', () => {
            if (!bookingData.artist) {
                showError('Please select an artist to continue.', document.getElementById('booking-step-1'));
                return;
            }
            
            goToStep(2);
        });
        
        document.getElementById('step-2-next').addEventListener('click', () => {
            if (!bookingData.service) {
                showError('Please select a service to continue.', document.getElementById('booking-step-2'));
                return;
            }
            
            if (bookingData.service === 'custom' && !bookingData.customDescription.trim()) {
                showError('Please describe your custom project.', document.getElementById('custom-description-container'));
                return;
            }
            
            goToStep(3);
        });
        
        document.getElementById('step-3-next').addEventListener('click', () => {
            if (!bookingData.date || !bookingData.time) {
                showError('Please select a date and time to continue.', document.getElementById('booking-step-3'));
                return;
            }
            
            goToStep(4);
        });
        
        document.getElementById('step-4-next').addEventListener('click', () => {
            // Validate form
            const clientName = document.getElementById('client-name').value.trim();
            const clientEmail = document.getElementById('client-email').value.trim();
            const clientPhone = document.getElementById('client-phone').value.trim();
            const tattooDescription = document.getElementById('tattoo-description').value.trim();
            const termsAccepted = document.getElementById('terms-conditions').checked;
            
            if (!clientName || !clientEmail || !clientPhone) {
                showError('Please fill in all required fields.', document.getElementById('booking-step-4'));
                return;
            }
            
            if (!termsAccepted) {
                showError('You must accept the terms and conditions to continue.', document.getElementById('terms-conditions').parentNode);
                return;
            }
            
            // Update booking data
            bookingData.clientName = clientName;
            bookingData.clientEmail = clientEmail;
            bookingData.clientPhone = clientPhone;
            bookingData.tattooDescription = tattooDescription;
            bookingData.isFirstTattoo = document.getElementById('first-tattoo').checked;
            
            // Update summary
            updateBookingSummary();
            
            goToStep(5);
        });
        
        // Back buttons
        document.getElementById('step-2-back').addEventListener('click', () => {
            goToStep(1);
        });
        
        document.getElementById('step-3-back').addEventListener('click', () => {
            goToStep(2);
        });
        
        document.getElementById('step-4-back').addEventListener('click', () => {
            goToStep(3);
        });
        
        document.getElementById('step-5-back').addEventListener('click', () => {
            goToStep(4);
        });
        
        // Confirm booking button
        document.getElementById('confirm-booking').addEventListener('click', confirmBooking);
        
        // Add to calendar button
        document.getElementById('add-to-calendar').addEventListener('click', addToCalendar);
        
        // Function to navigate to a specific step
        function goToStep(stepNumber) {
            // Update step indicators
            steps.forEach(step => {
                const stepNum = parseInt(step.getAttribute('data-step'));
                
                if (stepNum < stepNumber) {
                    step.classList.add('completed');
                    step.classList.remove('active');
                } else if (stepNum === stepNumber) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Show the corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
            });
            
            document.getElementById(`booking-step-${stepNumber}`).classList.add('active');
            
            // Scroll to top of the form
            window.scrollTo({
                top: document.querySelector('.booking-steps').offsetTop - 100,
                behavior: 'smooth'
            });
        }
    }
    
    // Load artists from Supabase
    async function loadArtists() {
        const artistsContainer = document.getElementById('booking-artists-container');
        
        if (!artistsContainer) return;
        
        try {
            const { data, error } = await supabase
                .from('artists')
                .select('*')
                .order('name');
                
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Clear skeleton loading
                artistsContainer.innerHTML = '';
                
                // Render artists
                data.forEach(artist => {
                    const artistCard = createArtistCard(artist);
                    artistsContainer.appendChild(artistCard);
                    
                    // Select artist if it matches URL parameter
                    if (artistId && artist.id.toString() === artistId) {
                        selectArtist(artist);
                        artistCard.classList.add('selected');
                    }
                });
                
                // Enable next button if an artist is pre-selected
                if (bookingData.artist) {
                    document.getElementById('step-1-next').disabled = false;
                }
            } else {
                // No artists found
                artistsContainer.innerHTML = '<p class="no-results">No artists found.</p>';
            }
        } catch (error) {
            console.error('Error loading artists:', error);
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
            </div>
        `;
        
        // Add click event to select artist
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            document.querySelectorAll('.artist-card').forEach(c => {
                c.classList.remove('selected');
            });
            
            // Add selected class to clicked card
            card.classList.add('selected');
            
            // Update booking data
            selectArtist(artist);
            
            // Enable next button
            document.getElementById('step-1-next').disabled = false;
        });
        
        return card;
    }
    
    // Select an artist
    function selectArtist(artist) {
        bookingData.artist = artist;
    }
    
    // Initialize service selection
    function initServiceSelection() {
        const serviceOptions = document.querySelectorAll('input[name="service"]');
        const customDescriptionContainer = document.getElementById('custom-description-container');
        const customDescription = document.getElementById('custom-description');
        
        serviceOptions.forEach(option => {
            option.addEventListener('change', () => {
                // Update booking data
                bookingData.service = option.value;
                
                // Show/hide custom description field
                if (option.value === 'custom') {
                    customDescriptionContainer.style.display = 'block';
                } else {
                    customDescriptionContainer.style.display = 'none';
                }
                
                // Enable next button
                document.getElementById('step-2-next').disabled = false;
            });
        });
        
        // Update custom description
        if (customDescription) {
            customDescription.addEventListener('input', () => {
                bookingData.customDescription = customDescription.value;
            });
        }
    }
    
    // Initialize date picker
    function initDatePicker() {
        const dateInput = document.getElementById('appointment-date');
        
        if (!dateInput) return;
        
        // Initialize flatpickr
        const picker = flatpickr(dateInput, {
            minDate: 'today',
            dateFormat: 'Y-m-d',
            disable: [
                function(date) {
                    // Disable Sundays
                    return date.getDay() === 0;
                }
            ],
            onChange: function(selectedDates, dateStr) {
                // Update booking data
                bookingData.date = dateStr;
                
                // Load available time slots
                loadTimeSlots(dateStr);
            }
        });
    }
    
    // Load available time slots
    async function loadTimeSlots(date) {
        const timeSlotsContainer = document.getElementById('time-slots-container');
        
        if (!timeSlotsContainer || !bookingData.artist) return;
        
        timeSlotsContainer.innerHTML = '<p>Loading available time slots...</p>';
        
        try {
            // Get existing appointments for the selected date and artist
            const { data: existingAppointments, error } = await supabase
                .from('appointments')
                .select('time_slot')
                .eq('date', date)
                .eq('artist_id', bookingData.artist.id)
                .eq('status', 'confirmed');
                
            if (error) throw error;
            
            // Generate time slots
            const timeSlots = generateTimeSlots();
            
            // Mark booked slots as unavailable
            const bookedSlots = existingAppointments.map(app => app.time_slot);
            
            // Clear container
            timeSlotsContainer.innerHTML = '';
            
            // Render time slots
            timeSlots.forEach(slot => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                if (bookedSlots.includes(slot)) {
                    timeSlot.classList.add('unavailable');
                    timeSlot.textContent = slot;
                } else {
                    timeSlot.textContent = slot;
                    
                    // Add click event to select time slot
                    timeSlot.addEventListener('click', () => {
                        // Remove selected class from all time slots
                        document.querySelectorAll('.time-slot').forEach(ts => {
                            ts.classList.remove('selected');
                        });
                        
                        // Add selected class to clicked time slot
                        timeSlot.classList.add('selected');
                        
                        // Update booking data
                        bookingData.time = slot;
                        
                        // Enable next button
                        document.getElementById('step-3-next').disabled = false;
                    });
                }
                
                timeSlotsContainer.appendChild(timeSlot);
            });
            
        } catch (error) {
            console.error('Error loading time slots:', error);
            timeSlotsContainer.innerHTML = '<p class="error">Error loading time slots. Please try again later.</p>';
        }
    }
    
    // Generate time slots (10am to 6pm, 1-hour intervals)
    function generateTimeSlots() {
        const slots = [];
        const startHour = 10; // 10am
        const endHour = 18; // 6pm
        
        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour}:00`);
        }
        
        return slots;
    }
    
    // Initialize reference images upload
    function initReferenceImages() {
        const referenceImagesInput = document.getElementById('reference-images');
        const referenceImagesPreview = document.getElementById('reference-images-preview');
        
        if (!referenceImagesInput || !referenceImagesPreview) return;
        
        referenceImagesInput.addEventListener('change', () => {
            // Clear preview
            referenceImagesPreview.innerHTML = '';
            
            // Clear booking data
            bookingData.referenceImages = [];
            
            // Preview selected images
            Array.from(referenceImagesInput.files).forEach(file => {
                // Create image preview
                const imagePreview = document.createElement('div');
                imagePreview.className = 'reference-image';
                
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.alt = file.name;
                
                const removeBtn = document.createElement('span');
                removeBtn.className = 'remove-image';
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    imagePreview.remove();
                    
                    // Remove from booking data
                    const index = bookingData.referenceImages.findIndex(img => img.name === file.name);
                    if (index !== -1) {
                        bookingData.referenceImages.splice(index, 1);
                    }
                });
                
                imagePreview.appendChild(img);
                imagePreview.appendChild(removeBtn);
                referenceImagesPreview.appendChild(imagePreview);
                
                // Add to booking data
                bookingData.referenceImages.push({
                    name: file.name,
                    file: file,
                    url: URL.createObjectURL(file)
                });
            });
        });
    }
    
    // Initialize terms and conditions modal
    function initTermsModal() {
        const termsLink = document.getElementById('terms-link');
        const termsModal = document.getElementById('terms-modal');
        const closeModal = termsModal?.querySelector('.close-modal');
        const acceptTerms = document.getElementById('accept-terms');
        
        if (!termsLink || !termsModal) return;
        
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            termsModal.style.display = 'block';
        });
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                termsModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === termsModal) {
                termsModal.style.display = 'none';
            }
        });
        
        // Accept terms button
        if (acceptTerms) {
            acceptTerms.addEventListener('click', () => {
                document.getElementById('terms-conditions').checked = true;
                termsModal.style.display = 'none';
            });
        }
    }
    
    // Update booking summary
    function updateBookingSummary() {
        // Artist summary
        const summaryArtist = document.getElementById('summary-artist');
        if (summaryArtist && bookingData.artist) {
            summaryArtist.innerHTML = `
                <div class="summary-artist-image">
                    <img src="${bookingData.artist.profile_image || 'images/placeholder-artist.jpg'}" alt="${bookingData.artist.name}">
                </div>
                <div class="summary-artist-info">
                    <h4>${bookingData.artist.name}</h4>
                    <p>${bookingData.artist.specialty || 'Tattoo Artist'}</p>
                </div>
            `;
        }
        
        // Service summary
        document.getElementById('summary-service').textContent = getServiceName(bookingData.service);
        document.getElementById('summary-date').textContent = formatDate(bookingData.date);
        document.getElementById('summary-time').textContent = bookingData.time;
        document.getElementById('summary-price').textContent = getServicePrice(bookingData.service);
        
        // Client summary
        document.getElementById('summary-name').textContent = bookingData.clientName;
        document.getElementById('summary-email').textContent = bookingData.clientEmail;
        document.getElementById('summary-phone').textContent = bookingData.clientPhone;
        document.getElementById('summary-description').textContent = bookingData.tattooDescription || 'No description provided.';
        
        // Reference images
        const summaryImages = document.getElementById('summary-images');
        const summaryImagesSection = document.getElementById('summary-images-section');
        
        if (summaryImages && summaryImagesSection) {
            if (bookingData.referenceImages.length > 0) {
                summaryImagesSection.style.display = 'block';
                summaryImages.innerHTML = '';
                
                bookingData.referenceImages.forEach(image => {
                    const imageElement = document.createElement('div');
                    imageElement.className = 'reference-image';
                    
                    const img = document.createElement('img');
                    img.src = image.url;
                    img.alt = image.name;
                    
                    imageElement.appendChild(img);
                    summaryImages.appendChild(imageElement);
                });
            } else {
                summaryImagesSection.style.display = 'none';
            }
        }
    }
    
    // Get service name
    function getServiceName(serviceValue) {
        switch (serviceValue) {
            case 'consultation':
                return 'Consultation';
            case 'small':
                return 'Small Tattoo';
            case 'medium':
                return 'Medium Tattoo';
            case 'large':
                return 'Large Tattoo';
            case 'custom':
                return 'Custom Project';
            default:
                return 'Unknown Service';
        }
    }
    
    // Get service price
    function getServicePrice(serviceValue) {
        switch (serviceValue) {
            case 'consultation':
                return 'Free';
            case 'small':
                return '$80-150';
            case 'medium':
                return '$150-300';
            case 'large':
                return '$300+';
            case 'custom':
                return 'Custom Quote';
            default:
                return 'Unknown Price';
        }
    }
    
    // Confirm booking
    async function confirmBooking() {
        // Disable confirm button to prevent multiple submissions
        const confirmButton = document.getElementById('confirm-booking');
        confirmButton.disabled = true;
        confirmButton.textContent = 'Processing...';
        
        try {
            // Check if user is logged in
            const user = await checkAuth();
            
            // Generate booking reference
            const bookingReference = generateId(8).toUpperCase();
            
            // Create appointment in Supabase
            const { data, error } = await supabase
                .from('appointments')
                .insert([
                    {
                        reference: bookingReference,
                        artist_id: bookingData.artist.id,
                        client_name: bookingData.clientName,
                        client_email: bookingData.clientEmail,
                        client_phone: bookingData.clientPhone,
                        service: bookingData.service,
                        custom_description: bookingData.customDescription,
                        date: bookingData.date,
                        time_slot: bookingData.time,
                        tattoo_description: bookingData.tattooDescription,
                        is_first_tattoo: bookingData.isFirstTattoo,
                        status: 'confirmed',
                        created_at: new Date().toISOString(),
                        user_id: user ? user.id : null
                    }
                ]);
                
            if (error) throw error;
            
            // Show confirmation
            document.getElementById('booking-step-5').classList.remove('active');
            document.getElementById('booking-confirmation').classList.add('active');
            
            // Update confirmation details
            document.getElementById('booking-reference').textContent = bookingReference;
            document.getElementById('confirmation-email').textContent = bookingData.clientEmail;
            
        } catch (error) {
            console.error('Error confirming booking:', error);
            showError('Error confirming booking. Please try again later.', confirmButton.parentNode);
            
            // Re-enable confirm button
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm Booking';
        }
    }
    
    // Add to calendar
    function addToCalendar() {
        // Format date and time for calendar
        const startDate = new Date(`${bookingData.date}T${bookingData.time}`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
        
        const startDateString = startDate.toISOString().replace(/-|:|\.\d+/g, '');
        const endDateString = endDate.toISOString().replace(/-|:|\.\d+/g, '');
        
        // Create calendar event details
        const eventDetails = {
            title: `Tattoo Appointment with ${bookingData.artist.name}`,
            description: `Service: ${getServiceName(bookingData.service)}\nArtist: ${bookingData.artist.name}\nLocation: InkMaster Studio, 123 Ink Street, Tattoo City`,
            start: startDateString,
            end: endDateString,
            location: 'InkMaster Studio, 123 Ink Street, Tattoo City'
        };
        
        // Generate Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`;
        
        // Open Google Calendar in a new tab
        window.open(googleCalendarUrl, '_blank');
    }
});
