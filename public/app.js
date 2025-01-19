document.addEventListener('DOMContentLoaded', () => {
    const connectionStatus = document.getElementById('connectionStatus');
    const registrationsTable = document.getElementById('registrationsTable');
    
    console.log('DOM loaded, elements found:', {
        connectionStatus: !!connectionStatus,
        registrationsTable: !!registrationsTable
    });

    // Keep track of displayed registrations
    const displayedRegistrations = new Set();

    // Update connection status
    async function updateConnectionStatus() {
        try {
            const response = await fetch('/debug/status');
            const data = await response.json();
            console.log('Connection status:', data);
            
            const airmeetConnected = data.services.airmeet.status === 'connected';
            const devrevConnected = data.services.devrev.status === 'connected';
            
            connectionStatus.textContent = airmeetConnected && devrevConnected ? 'Connected' : 'Disconnected';
            connectionStatus.className = airmeetConnected && devrevConnected 
                ? 'connection-status-connected px-3 py-1 rounded-full text-sm font-medium'
                : 'connection-status-disconnected px-3 py-1 rounded-full text-sm font-medium';
        } catch (error) {
            console.error('Error updating connection status:', error);
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.className = 'connection-status-disconnected px-3 py-1 rounded-full text-sm font-medium';
        }
    }

    // Format date
    function formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return dateString;
        }
    }

    // Add a new registration row
    function addRegistrationRow(registration) {
        console.log('Adding registration row:', registration);
        
        // Create unique ID for this registration
        const registrationId = registration.id || `${registration.email}-${registration.registration_date}`;
        
        // Skip if already displayed
        if (displayedRegistrations.has(registrationId)) {
            console.log('Registration already displayed:', registrationId);
            return;
        }

        try {
            const tbody = registrationsTable.getElementsByTagName('tbody')[0];
            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50';
            
            // Format registration data
            const data = {
                name: `${registration.first_name} ${registration.last_name}`,
                email: registration.email,
                organization: registration.organization || '-',
                jobTitle: registration.job_title || '-',
                registrationDate: formatDate(registration.registration_date),
                status: registration.status || 'registered'
            };
            
            // Add cells
            Object.values(data).forEach(value => {
                const cell = document.createElement('td');
                cell.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                cell.textContent = value;
                row.appendChild(cell);
            });
            
            // Add to table and tracking set
            tbody.insertBefore(row, tbody.firstChild);
            displayedRegistrations.add(registrationId);
            console.log('Successfully added registration row:', registrationId);
        } catch (error) {
            console.error('Error adding registration row:', error);
        }
    }

    // Fetch recent registrations
    async function fetchRecentRegistrations() {
        try {
            console.log('Fetching recent registrations...');
            const response = await fetch('/debug/mappings?count=20');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Received mappings data:', data);
            
            // Add new rows without clearing existing ones
            if (Array.isArray(data)) {
                data.forEach(item => {
                    console.log('Processing item:', item);
                    if (item.type === 'contact' && item.source) {
                        addRegistrationRow(item.source);
                    }
                });
            } else {
                console.error('Received non-array data:', data);
            }
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    }

    // Initial load
    updateConnectionStatus();
    fetchRecentRegistrations();

    // Refresh data periodically
    setInterval(updateConnectionStatus, 5000);
    setInterval(fetchRecentRegistrations, 5000);
});
