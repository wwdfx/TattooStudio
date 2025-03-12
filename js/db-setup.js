/**
 * V.SHAI TATTOO - Tattoo Management System
 * Database Setup Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get Supabase client from the config
    const { supabase } = window.supabaseConfig;
    
    // Get DOM elements
    const connectionStatus = document.getElementById('connection-status');
    const initDatabaseBtn = document.getElementById('init-database');
    const initStatus = document.getElementById('init-status');
    const setupProgress = document.getElementById('setup-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const setupLog = document.getElementById('setup-log');
    const includeSampleData = document.getElementById('include-sample-data');
    
    // Table status elements
    const clientsStatus = document.getElementById('clients-status');
    const artistsStatus = document.getElementById('artists-status');
    const appointmentsStatus = document.getElementById('appointments-status');
    const portfolioItemsStatus = document.getElementById('portfolio-items-status');
    const adminUsersStatus = document.getElementById('admin-users-status');
    
    // Check connection to Supabase
    checkConnection();
    
    // Add event listeners
    if (initDatabaseBtn) {
        initDatabaseBtn.addEventListener('click', initializeDatabase);
    }
    
    // Check connection to Supabase
    async function checkConnection() {
        if (!connectionStatus) return;
        
        try {
            // Try to get a simple response from Supabase
            const { data, error } = await supabase.from('clients').select('count', { count: 'exact', head: true });
            
            if (error) throw error;
            
            // Connection successful
            connectionStatus.innerHTML = '<p><strong>Status:</strong> Connected to Supabase successfully!</p>';
            connectionStatus.className = 'setup-status success';
            
            // Check if tables exist
            checkTablesExist();
            
        } catch (error) {
            console.error('Connection error:', error);
            connectionStatus.innerHTML = `<p><strong>Status:</strong> Error connecting to Supabase.</p><p>${error.message || 'Unknown error'}</p>`;
            connectionStatus.className = 'setup-status error';
            
            // Disable initialize button
            if (initDatabaseBtn) {
                initDatabaseBtn.disabled = true;
            }
        }
    }
    
    // Check if tables exist
    async function checkTablesExist() {
        try {
            // Check clients table
            await checkTableExists('clients', clientsStatus);
            
            // Check artists table
            await checkTableExists('artists', artistsStatus);
            
            // Check appointments table
            await checkTableExists('appointments', appointmentsStatus);
            
            // Check portfolio_items table
            await checkTableExists('portfolio_items', portfolioItemsStatus);
            
            // Check admin_users table
            await checkTableExists('admin_users', adminUsersStatus);
            
        } catch (error) {
            console.error('Error checking tables:', error);
        }
    }
    
    // Check if a specific table exists
    async function checkTableExists(tableName, statusElement) {
        if (!statusElement) return;
        
        try {
            // Try to get a simple response from the table
            const { data, error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
            
            if (error && error.code === '42P01') {
                // Table doesn't exist (PostgreSQL error code for undefined table)
                statusElement.textContent = 'Not created';
                statusElement.className = '';
                return false;
            } else if (error) {
                throw error;
            }
            
            // Table exists
            statusElement.textContent = 'Created';
            statusElement.className = 'success';
            return true;
            
        } catch (error) {
            console.error(`Error checking ${tableName} table:`, error);
            statusElement.textContent = 'Error';
            statusElement.className = 'error';
            return false;
        }
    }
    
    // Initialize database
    async function initializeDatabase() {
        // Show status elements
        if (initStatus) initStatus.style.display = 'block';
        if (setupProgress) setupProgress.style.display = 'flex';
        if (setupLog) setupLog.style.display = 'block';
        
        // Disable initialize button
        if (initDatabaseBtn) {
            initDatabaseBtn.disabled = true;
            initDatabaseBtn.textContent = 'Initializing...';
        }
        
        // Update status
        if (initStatus) {
            initStatus.innerHTML = '<p>Initializing database...</p>';
            initStatus.className = 'setup-status info';
        }
        
        // Clear log
        if (setupLog) {
            setupLog.textContent = '';
        }
        
        try {
            // Create tables
            await createTables();
            
            // Add sample data if checkbox is checked
            if (includeSampleData && includeSampleData.checked) {
                await addSampleData();
            }
            
            // Update status
            if (initStatus) {
                initStatus.innerHTML = '<p>Database initialized successfully!</p>';
                initStatus.className = 'setup-status success';
            }
            
            // Update progress
            updateProgress(100, '100%');
            
            // Re-check tables
            checkTablesExist();
            
            // Re-enable initialize button
            if (initDatabaseBtn) {
                initDatabaseBtn.disabled = false;
                initDatabaseBtn.textContent = 'Initialize Database';
            }
            
        } catch (error) {
            console.error('Error initializing database:', error);
            
            // Update status
            if (initStatus) {
                initStatus.innerHTML = `<p>Error initializing database: ${error.message || 'Unknown error'}</p>`;
                initStatus.className = 'setup-status error';
            }
            
            // Log error
            logMessage(`Error: ${error.message || 'Unknown error'}`);
            
            // Re-enable initialize button
            if (initDatabaseBtn) {
                initDatabaseBtn.disabled = false;
                initDatabaseBtn.textContent = 'Retry Initialization';
            }
        }
    }
    
    // Create database tables
    async function createTables() {
        // Update progress
        updateProgress(10, '10%');
        logMessage('Starting database initialization...');
        
        // Create clients table
        logMessage('Creating clients table...');
        const { error: clientsError } = await supabase.rpc('create_clients_table');
        
        if (clientsError) {
            logMessage(`Error creating clients table: ${clientsError.message}`);
            throw clientsError;
        }
        
        logMessage('Clients table created successfully.');
        updateProgress(30, '30%');
        
        // Create artists table
        logMessage('Creating artists table...');
        const { error: artistsError } = await supabase.rpc('create_artists_table');
        
        if (artistsError) {
            logMessage(`Error creating artists table: ${artistsError.message}`);
            throw artistsError;
        }
        
        logMessage('Artists table created successfully.');
        updateProgress(50, '50%');
        
        // Create appointments table
        logMessage('Creating appointments table...');
        const { error: appointmentsError } = await supabase.rpc('create_appointments_table');
        
        if (appointmentsError) {
            logMessage(`Error creating appointments table: ${appointmentsError.message}`);
            throw appointmentsError;
        }
        
        logMessage('Appointments table created successfully.');
        updateProgress(70, '70%');
        
        // Create portfolio_items table
        logMessage('Creating portfolio_items table...');
        const { error: portfolioItemsError } = await supabase.rpc('create_portfolio_items_table');
        
        if (portfolioItemsError) {
            logMessage(`Error creating portfolio_items table: ${portfolioItemsError.message}`);
            throw portfolioItemsError;
        }
        
        logMessage('Portfolio items table created successfully.');
        updateProgress(85, '85%');
        
        // Create admin_users table
        logMessage('Creating admin_users table...');
        const { error: adminUsersError } = await supabase.rpc('create_admin_users_table');
        
        if (adminUsersError) {
            logMessage(`Error creating admin_users table: ${adminUsersError.message}`);
            throw adminUsersError;
        }
        
        logMessage('Admin users table created successfully.');
        updateProgress(95, '95%');
        
        // Create additional tables
        logMessage('Creating additional tables...');
        const { error: additionalTablesError } = await supabase.rpc('create_additional_tables');
        
        if (additionalTablesError) {
            logMessage(`Error creating additional tables: ${additionalTablesError.message}`);
            throw additionalTablesError;
        }
        
        logMessage('Additional tables created successfully.');
        updateProgress(100, '100%');
        
        logMessage('All tables created successfully!');
    }
    
    // Add sample data to the database
    async function addSampleData() {
        logMessage('Adding sample data...');
        updateProgress(50, '50%');
        
        // Add sample artists
        logMessage('Adding sample artists...');
        const { error: artistsError } = await supabase.rpc('add_sample_artists');
        
        if (artistsError) {
            logMessage(`Error adding sample artists: ${artistsError.message}`);
            throw artistsError;
        }
        
        logMessage('Sample artists added successfully.');
        updateProgress(60, '60%');
        
        // Add sample clients
        logMessage('Adding sample clients...');
        const { error: clientsError } = await supabase.rpc('add_sample_clients');
        
        if (clientsError) {
            logMessage(`Error adding sample clients: ${clientsError.message}`);
            throw clientsError;
        }
        
        logMessage('Sample clients added successfully.');
        updateProgress(70, '70%');
        
        // Add sample portfolio items
        logMessage('Adding sample portfolio items...');
        const { error: portfolioItemsError } = await supabase.rpc('add_sample_portfolio_items');
        
        if (portfolioItemsError) {
            logMessage(`Error adding sample portfolio items: ${portfolioItemsError.message}`);
            throw portfolioItemsError;
        }
        
        logMessage('Sample portfolio items added successfully.');
        updateProgress(80, '80%');
        
        // Add sample appointments
        logMessage('Adding sample appointments...');
        const { error: appointmentsError } = await supabase.rpc('add_sample_appointments');
        
        if (appointmentsError) {
            logMessage(`Error adding sample appointments: ${appointmentsError.message}`);
            throw appointmentsError;
        }
        
        logMessage('Sample appointments added successfully.');
        updateProgress(90, '90%');
        
        // Add admin user
        logMessage('Adding admin user...');
        const { error: adminUserError } = await supabase.rpc('add_admin_user');
        
        if (adminUserError) {
            logMessage(`Error adding admin user: ${adminUserError.message}`);
            throw adminUserError;
        }
        
        logMessage('Admin user added successfully.');
        updateProgress(100, '100%');
        
        logMessage('All sample data added successfully!');
    }
    
    // Update progress bar
    function updateProgress(percentage, text) {
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = text;
        }
    }
    
    // Log message to setup log
    function logMessage(message) {
        if (setupLog) {
            const timestamp = new Date().toLocaleTimeString();
            setupLog.textContent += `[${timestamp}] ${message}\n`;
            setupLog.scrollTop = setupLog.scrollHeight;
        }
        
        console.log(message);
    }
});
