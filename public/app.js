document.addEventListener('DOMContentLoaded', () => {
    const connectionStatus = document.getElementById('connectionStatus');
    const registrationsTable = document.getElementById('registrationsTable');

    // Update connection status
    async function updateConnectionStatus() {
        try {
            const response = await fetch('/debug/status');
            const data = await response.json();
            
            const airmeetConnected = data.services.airmeet.status === 'connected';
            const devrevConnected = data.services.devrev.status === 'connected';
            
            connectionStatus.textContent = airmeetConnected && devrevConnected ? 'Connected' : 'Disconnected';
            connectionStatus.className = airmeetConnected && devrevConnected 
                ? 'connection-status-connected px-3 py-1 rounded-full text-sm font-medium'
                : 'connection-status-disconnected px-3 py-1 rounded-full text-sm font-medium';
        } catch (error) {
            connectionStatus.textContent = 'Disconnected';
            connectionStatus.className = 'connection-status-disconnected px-3 py-1 rounded-full text-sm font-medium';
        }
    }

    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleString();
    }

    // Add a new registration row
    function addRegistrationRow(registration) {
        const row = document.createElement('tr');
        row.className = 'animate-fade-in';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${registration.firstName} ${registration.lastName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${registration.email}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${formatDate(registration.registrationTime)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${registration.utmParameters?.source || 'Direct'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="status-success">Registered</span>
            </td>
        `;
        
        registrationsTable.insertBefore(row, registrationsTable.firstChild);
    }

    // Fetch recent registrations
    async function fetchRecentRegistrations() {
        try {
            const response = await fetch('/debug/mappings');
            const data = await response.json();
            
            // Clear existing rows
            registrationsTable.innerHTML = '';
            
            // Add new rows
            data.forEach(item => {
                if (item.type === 'contact') {
                    addRegistrationRow(item.source);
                }
            });
        } catch (error) {
            console.error('Error fetching registrations:', error);
        }
    }

    // Initial load
    updateConnectionStatus();
    fetchRecentRegistrations();

    // Refresh data periodically
    setInterval(updateConnectionStatus, 10000);
    setInterval(fetchRecentRegistrations, 10000);
});
