/**
 * InkMaster Studio - Tattoo Management System
 * Supabase Configuration
 */

// Supabase configuration
const SUPABASE_URL = 'https://uhqersobdtbbbkneyqwi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVocWVyc29iZHRiYmJrbmV5cXdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NzIwMzAsImV4cCI6MjA1NzM0ODAzMH0.-80xZUsbA5jmQO9U1RuBygBleShVZm1WN91vD8ji98I';

// Initialize Supabase client
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if the user is logged in
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Check if the user is an admin
async function checkAdmin() {
    const user = await checkAuth();
    
    if (!user) return false;
    
    // Check if the user is in the admin_users table
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();
    
    if (error || !data) return false;
    
    return true;
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time for display
function formatTime(timeString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(timeString).toLocaleTimeString(undefined, options);
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
}

// Generate a random ID
function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

// Show error message
function showError(message, element) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    if (element) {
        // If an element is provided, append the error message after it
        element.parentNode.insertBefore(errorElement, element.nextSibling);
        
        // Remove the error message after 5 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    } else {
        // If no element is provided, show an alert
        alert(message);
    }
}

// Show success message
function showSuccess(message, element) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    if (element) {
        // If an element is provided, append the success message after it
        element.parentNode.insertBefore(successElement, element.nextSibling);
        
        // Remove the success message after 5 seconds
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    } else {
        // If no element is provided, show an alert
        alert(message);
    }
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.add('loaded');
                    imageObserver.unobserve(image);
                }
            });
        });
        
        images.forEach(image => {
            imageObserver.observe(image);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach(image => {
            image.src = image.dataset.src;
            image.classList.add('loaded');
        });
    }
}

// Export functions for use in other files
window.supabaseConfig = {
    supabase,
    checkAuth,
    checkAdmin,
    formatDate,
    formatTime,
    formatDateTime,
    generateId,
    showError,
    showSuccess,
    lazyLoadImages
};
