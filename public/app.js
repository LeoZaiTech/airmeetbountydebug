document.addEventListener('DOMContentLoaded', () => {
    const connectionStatus = document.getElementById('connectionStatus');
    const registrationsTable = document.getElementById('registrationsTable');
    
    console.log('DOM loaded, elements found:', {
        connectionStatus: !!connectionStatus,
        registrationsTable: !!registrationsTable
    });

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
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${registration.firstName || ''} ${registration.lastName || ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${registration.email || ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(registration.registrationTime)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${registration.utmParameters?.source || 'Direct'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="status-success px-2 py-1 rounded-full text-xs">Registered</span>
            </td>
        `;
        
        registrationsTable.appendChild(row);
        console.log('Row added to table');
    }

    // Fetch recent registrations
    async function fetchRecentRegistrations() {
        try {
            console.log('Fetching recent registrations...');
            const response = await fetch('/debug/mappings');
            const data = await response.json();
            console.log('Received mappings data:', data);
            
            // Clear existing rows
            registrationsTable.innerHTML = '';
            console.log('Cleared existing rows');
            
            // Add new rows
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
