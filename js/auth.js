/**
 * V.SHAI TATTOO - Tattoo Management System
 * Authentication Module
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get references to elements
    const loginBtn = document.getElementById('login-btn');
    const authModal = document.getElementById('auth-modal');
    const closeModal = authModal?.querySelector('.close-modal');
    const authTabs = authModal?.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const adminLogout = document.getElementById('admin-logout');
    const adminLogoutDropdown = document.getElementById('admin-logout-dropdown');
    
    // Get Supabase client from the config
    const { supabase, checkAuth, checkAdmin } = window.supabaseConfig;
    
    // Initialize authentication state
    initAuth();
    
    // Event listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'block';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    if (authModal) {
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });
    }
    
    // Auth tabs
    if (authTabs) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                authTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding form
                const tabName = tab.getAttribute('data-tab');
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                
                document.getElementById(`${tabName}-form`).classList.add('active');
            });
        });
    }
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const messageElement = loginForm.querySelector('.form-message');
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (error) throw error;
                
                messageElement.textContent = 'Login successful!';
                messageElement.className = 'form-message success';
                
                // Check if user is admin
                const isAdmin = await checkAdmin();
                
                // Redirect based on user role
                setTimeout(() => {
                    if (isAdmin) {
                        window.location.href = 'admin/dashboard.html';
                    } else {
                        // Reload the current page
                        window.location.reload();
                    }
                }, 1000);
                
            } catch (error) {
                messageElement.textContent = error.message || 'Login failed. Please try again.';
                messageElement.className = 'form-message error';
            }
        });
    }
    
    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const messageElement = signupForm.querySelector('.form-message');
            
            // Validate passwords match
            if (password !== confirmPassword) {
                messageElement.textContent = 'Passwords do not match.';
                messageElement.className = 'form-message error';
                return;
            }
            
            try {
                // Create user in Supabase Auth
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: name
                        }
                    }
                });
                
                if (error) throw error;
                
                // Create user in clients table
                const { error: clientError } = await supabase
                    .from('clients')
                    .insert([
                        {
                            email,
                            name,
                            created_at: new Date().toISOString()
                        }
                    ]);
                
                if (clientError) throw clientError;
                
                messageElement.textContent = 'Account created successfully! You can now log in.';
                messageElement.className = 'form-message success';
                
                // Switch to login tab after successful signup
                setTimeout(() => {
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                }, 2000);
                
            } catch (error) {
                messageElement.textContent = error.message || 'Signup failed. Please try again.';
                messageElement.className = 'form-message error';
            }
        });
    }
    
    // Admin logout
    if (adminLogout) {
        adminLogout.addEventListener('click', handleLogout);
    }
    
    if (adminLogoutDropdown) {
        adminLogoutDropdown.addEventListener('click', handleLogout);
    }
    
    // Handle admin profile dropdown
    const adminProfile = document.querySelector('.admin-profile');
    const adminDropdown = document.getElementById('admin-dropdown');
    
    if (adminProfile && adminDropdown) {
        adminProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            adminDropdown.style.display = adminDropdown.style.display === 'block' ? 'none' : 'block';
            
            // Position the dropdown
            const rect = adminProfile.getBoundingClientRect();
            adminDropdown.style.top = `${rect.bottom}px`;
            adminDropdown.style.right = `20px`;
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            adminDropdown.style.display = 'none';
        });
        
        // Prevent dropdown from closing when clicking inside it
        adminDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Handle notifications dropdown
    const notificationsIcon = document.querySelector('.notifications');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    if (notificationsIcon && notificationDropdown) {
        notificationsIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
            
            // Position the dropdown
            const rect = notificationsIcon.getBoundingClientRect();
            notificationDropdown.style.top = `${rect.bottom}px`;
            notificationDropdown.style.right = `20px`;
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            notificationDropdown.style.display = 'none';
        });
        
        // Prevent dropdown from closing when clicking inside it
        notificationDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Mark all as read
        const markAllRead = notificationDropdown.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', (e) => {
                e.preventDefault();
                const unreadItems = notificationDropdown.querySelectorAll('.notification-item.unread');
                unreadItems.forEach(item => {
                    item.classList.remove('unread');
                });
                
                // Update notification badge
                const badge = document.querySelector('.notification-badge');
                if (badge) {
                    badge.textContent = '0';
                }
            });
        }
    }
    
    // Initialize authentication state
    async function initAuth() {
        const user = await checkAuth();
        
        // Update UI based on auth state
        if (user) {
            // User is logged in
            if (loginBtn) {
                loginBtn.textContent = 'My Account';
                loginBtn.href = 'account.html';
            }
            
            // Check if on admin page
            if (window.location.pathname.includes('/admin/')) {
                const isAdmin = await checkAdmin();
                
                if (!isAdmin) {
                    // Redirect non-admin users
                    window.location.href = '../index.html';
                } else {
                    // Update admin UI
                    const adminName = document.getElementById('admin-name');
                    if (adminName) {
                        adminName.textContent = user.user_metadata.full_name || user.email;
                    }
                    
                    // Show admin content
                    document.body.classList.add('admin-authenticated');
                }
            }
        } else {
            // User is not logged in
            if (window.location.pathname.includes('/admin/')) {
                // Redirect to home page
                window.location.href = '../index.html';
            }
        }
    }
    
    // Handle logout
    async function handleLogout(e) {
        e.preventDefault();
        
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) throw error;
            
            // Redirect to home page
            window.location.href = window.location.pathname.includes('/admin/') 
                ? '../index.html' 
                : 'index.html';
                
        } catch (error) {
            console.error('Error logging out:', error.message);
            alert('Error logging out. Please try again.');
        }
    }
});
