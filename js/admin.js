/**
 * InkMaster Studio - Tattoo Management System
 * Admin Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get Supabase client and utility functions from the config
    const { 
        supabase, 
        checkAuth,
        checkAdmin,
        formatDate, 
        formatDateTime,
        showError, 
        showSuccess 
    } = window.supabaseConfig;
    
    // Check if user is admin
    checkAdminAccess();
    
    // Initialize components
    loadDashboardStats();
    loadUpcomingAppointments();
    loadRecentClients();
    initArtistPerformanceChart();
    
    // Check if user has admin access
    async function checkAdminAccess() {
        const isAdmin = await checkAdmin();
        
        if (!isAdmin) {
            // Redirect to home page if not admin
            window.location.href = '../index.html';
        }
    }
    
    // Load dashboard statistics
    async function loadDashboardStats() {
        try {
            // Get today's appointments count
            const today = new Date().toISOString().split('T')[0];
            const { data: todayAppointments, error: appointmentsError } = await supabase
                .from('appointments')
                .select('count', { count: 'exact', head: true })
                .eq('date', today);
                
            if (appointmentsError) throw appointmentsError;
            
            // Get total clients count
            const { data: totalClients, error: clientsError } = await supabase
                .from('clients')
                .select('count', { count: 'exact', head: true });
                
            if (clientsError) throw clientsError;
            
            // Get active artists count
            const { data: activeArtists, error: artistsError } = await supabase
                .from('artists')
                .select('count', { count: 'exact', head: true })
                .eq('active', true);
                
            if (artistsError) throw artistsError;
            
            // Get monthly revenue
            const { data: monthlyRevenue, error: revenueError } = await supabase.rpc('get_monthly_revenue');
            
            if (revenueError) throw revenueError;
            
            // Update stats in the UI
            document.getElementById('today-appointments').textContent = todayAppointments.count || 0;
            document.getElementById('total-clients').textContent = totalClients.count || 0;
            document.getElementById('active-artists').textContent = activeArtists.count || 0;
            document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue || 0}`;
            
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        }
    }
    
    // Load upcoming appointments
    async function loadUpcomingAppointments() {
        const appointmentsTable = document.getElementById('upcoming-appointments-table');
        
        if (!appointmentsTable) return;
        
        try {
            // Get upcoming appointments
            const { data, error } = await supabase
                .from('appointments')
                .select(`
                    id,
                    reference,
                    client_name,
                    service,
                    date,
                    time_slot,
                    status,
                    artists (
                        id,
                        name
                    )
                `)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true })
                .order('time_slot', { ascending: true })
                .limit(10);
                
            if (error) throw error;
            
            // Clear skeleton loading
            appointmentsTable.innerHTML = '';
            
            if (data && data.length > 0) {
                // Render appointments
                data.forEach(appointment => {
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${appointment.client_name}</td>
                        <td>${appointment.artists?.name || 'Unknown'}</td>
                        <td>${getServiceName(appointment.service)}</td>
                        <td>${formatDate(appointment.date)} ${appointment.time_slot}</td>
                        <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
                        <td>
                            <div class="table-actions">
                                <a href="appointments.html?id=${appointment.id}" title="View Details"><i class="fas fa-eye"></i></a>
                                <a href="appointments.html?id=${appointment.id}&edit=true" title="Edit"><i class="fas fa-edit"></i></a>
                                <a href="#" class="delete-appointment" data-id="${appointment.id}" title="Cancel"><i class="fas fa-times"></i></a>
                            </div>
                        </td>
                    `;
                    
                    appointmentsTable.appendChild(row);
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-appointment').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        if (confirm('Are you sure you want to cancel this appointment?')) {
                            const appointmentId = button.getAttribute('data-id');
                            
                            try {
                                const { error } = await supabase
                                    .from('appointments')
                                    .update({ status: 'cancelled' })
                                    .eq('id', appointmentId);
                                    
                                if (error) throw error;
                                
                                // Reload appointments
                                loadUpcomingAppointments();
                                
                            } catch (error) {
                                console.error('Error cancelling appointment:', error);
                                alert('Error cancelling appointment. Please try again.');
                            }
                        }
                    });
                });
                
            } else {
                // No appointments found
                appointmentsTable.innerHTML = '<tr><td colspan="6" class="text-center">No upcoming appointments found.</td></tr>';
            }
            
        } catch (error) {
            console.error('Error loading upcoming appointments:', error);
            appointmentsTable.innerHTML = '<tr><td colspan="6" class="text-center">Error loading appointments. Please try again later.</td></tr>';
        }
    }
    
    // Load recent clients
    async function loadRecentClients() {
        const clientsTable = document.getElementById('recent-clients-table');
        
        if (!clientsTable) return;
        
        try {
            // Get recent clients
            const { data, error } = await supabase
                .from('clients')
                .select(`
                    id,
                    name,
                    email,
                    phone,
                    created_at
                `)
                .order('created_at', { ascending: false })
                .limit(5);
                
            if (error) throw error;
            
            // Clear skeleton loading
            clientsTable.innerHTML = '';
            
            if (data && data.length > 0) {
                // Render clients
                data.forEach(async client => {
                    // Get appointment count for this client
                    const { data: appointmentsData, error: appointmentsError } = await supabase
                        .from('appointments')
                        .select('count', { count: 'exact', head: true })
                        .eq('client_email', client.email);
                        
                    if (appointmentsError) throw appointmentsError;
                    
                    const appointmentCount = appointmentsData.count || 0;
                    
                    const row = document.createElement('tr');
                    
                    row.innerHTML = `
                        <td>${client.name}</td>
                        <td>${client.email}</td>
                        <td>${client.phone || 'N/A'}</td>
                        <td>${appointmentCount}</td>
                        <td>${formatDate(client.created_at)}</td>
                    `;
                    
                    clientsTable.appendChild(row);
                });
                
            } else {
                // No clients found
                clientsTable.innerHTML = '<tr><td colspan="5" class="text-center">No clients found.</td></tr>';
            }
            
        } catch (error) {
            console.error('Error loading recent clients:', error);
            clientsTable.innerHTML = '<tr><td colspan="5" class="text-center">Error loading clients. Please try again later.</td></tr>';
        }
    }
    
    // Initialize artist performance chart
    async function initArtistPerformanceChart() {
        const chartContainer = document.getElementById('artist-performance-chart');
        
        if (!chartContainer) return;
        
        try {
            // Get artist performance data
            const { data, error } = await supabase.rpc('get_artist_performance');
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Prepare chart data
                const labels = data.map(item => item.artist_name);
                const appointmentCounts = data.map(item => item.appointment_count);
                const revenue = data.map(item => item.revenue);
                
                // Create chart
                const ctx = document.createElement('canvas');
                chartContainer.innerHTML = '';
                chartContainer.appendChild(ctx);
                
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Appointments',
                                data: appointmentCounts,
                                backgroundColor: 'rgba(79, 93, 117, 0.7)',
                                borderColor: 'rgba(79, 93, 117, 1)',
                                borderWidth: 1
                            },
                            {
                                label: 'Revenue ($)',
                                data: revenue,
                                backgroundColor: 'rgba(239, 131, 84, 0.7)',
                                borderColor: 'rgba(239, 131, 84, 1)',
                                borderWidth: 1,
                                yAxisID: 'y1'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Appointments'
                                }
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'right',
                                grid: {
                                    drawOnChartArea: false
                                },
                                title: {
                                    display: true,
                                    text: 'Revenue ($)'
                                }
                            }
                        }
                    }
                });
                
            } else {
                // No data found
                chartContainer.innerHTML = '<div class="chart-placeholder"><p>No performance data available.</p></div>';
            }
            
        } catch (error) {
            console.error('Error loading artist performance data:', error);
            chartContainer.innerHTML = '<div class="chart-placeholder"><p>Error loading performance data. Please try again later.</p></div>';
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
                return serviceValue;
        }
    }
});
