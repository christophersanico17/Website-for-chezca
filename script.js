const STORAGE_KEY = 'libraryTablesData';
const USERS_STORAGE_KEY = 'libraryUsersData';
const USER_STORAGE_KEY = 'libraryCurrentUser';
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize default tables
const defaultTables = [
    { id: 1, name: 'Table 1', capacity: 4, booked: 0, bookings: [] },
    { id: 2, name: 'Table 2', capacity: 4, booked: 0, bookings: [] },
    { id: 3, name: 'Table 3', capacity: 6, booked: 0, bookings: [] },
    { id: 4, name: 'Table 4', capacity: 6, booked: 0, bookings: [] },
    { id: 5, name: 'Table 5', capacity: 8, booked: 0, bookings: [] },
    { id: 6, name: 'Table 6', capacity: 2, booked: 0, bookings: [] },
    { id: 7, name: 'Table 7', capacity: 4, booked: 0, bookings: [] },
    { id: 8, name: 'Table 8', capacity: 6, booked: 0, bookings: [] },
];

let tables = [];
let users = [];
let currentFilter = 'all';
let selectedTableId = null;
let currentUser = null;
let isAdmin = false;
let selectedUserForDeletion = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupLoginEventListeners();
    checkExistingSession();
});

function initializeData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        tables = JSON.parse(savedData);
    } else {
        tables = JSON.parse(JSON.stringify(defaultTables));
        saveData();
    }

    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        users = [];
        saveUsers();
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
}

function saveUsers() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function checkExistingSession() {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser) {
        const user = JSON.parse(savedUser);
        currentUser = user;
        isAdmin = user.isAdmin;
        enterApplication();
    }
}

function setupLoginEventListeners() {
    // Tab switching
    document.querySelectorAll('.login-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            document.querySelectorAll('.login-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.login-tab-content').forEach(content => content.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`${tab}LoginTab`).classList.add('active');
        });
    });

    // User login form
    document.getElementById('userLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();

        if (!name || !email) {
            alert('Please fill in all fields');
            return;
        }

        // Check if user already exists
        let user = users.find(u => u.email === email);
        if (!user) {
            user = {
                id: Date.now(),
                name: name,
                email: email,
                createdAt: new Date().toISOString(),
                isAdmin: false
            };
            users.push(user);
            saveUsers();
        }

        currentUser = user;
        isAdmin = false;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        enterApplication();
    });

    // Admin login form
    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value.trim();

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            currentUser = { name: 'Admin User', username, isAdmin: true };
            isAdmin = true;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
            enterApplication();
        } else {
            alert('Invalid admin credentials. Please try again.');
            document.getElementById('adminPassword').value = '';
        }
    });
}

function enterApplication() {
    // Hide login page and show main app
    document.getElementById('loginPage').classList.remove('show');
    document.getElementById('mainApp').classList.remove('hidden');

    // Update header with user info
    document.getElementById('currentUserDisplay').textContent = isAdmin ? 'Admin User' : currentUser.name;
    document.getElementById('userRoleDisplay').textContent = isAdmin ? 'ADMIN' : 'USER';
    document.getElementById('userRoleDisplay').style.background = isAdmin ? 'rgba(255, 99, 132, 0.8)' : 'rgba(76, 175, 80, 0.8)';

    // Show/hide admin panel
    if (isAdmin) {
        document.getElementById('adminPanel').classList.remove('hidden');
        document.getElementById('headerSubtitle').textContent = 'Admin Control Panel - Manage Library Tables';
        setupAdminEventListeners();
        updateAdminStats();
        displayAdminDataTabs();
    } else {
        document.getElementById('adminPanel').classList.add('hidden');
        document.getElementById('headerSubtitle').textContent = 'Reserve and manage table availability';
    }

    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Setup main application
    renderTables();
    setupApplicationEventListeners();
    updateStatistics();
}

function setupApplicationEventListeners() {
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTables();
        });
    });

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('show');
        });
    });

    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });

    // Booking modal confirmation
    const confirmBtn = document.getElementById('confirmBooking');
    if (confirmBtn && !confirmBtn.hasListener) {
        confirmBtn.addEventListener('click', confirmBooking);
        confirmBtn.hasListener = true;
    }
    
    const releaseBtn = document.getElementById('releaseTableBtn');
    if (releaseBtn && !releaseBtn.hasListener) {
        releaseBtn.addEventListener('click', releaseTable);
        releaseBtn.hasListener = true;
    }

    // Delete user modal
    const cancelBtn = document.getElementById('cancelDeleteUserBtn');
    if (cancelBtn && !cancelBtn.hasListener) {
        cancelBtn.addEventListener('click', () => {
            document.getElementById('deleteUserModal').classList.remove('show');
        });
        cancelBtn.hasListener = true;
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteUserBtn');
    if (confirmDeleteBtn && !confirmDeleteBtn.hasListener) {
        confirmDeleteBtn.addEventListener('click', confirmDeleteUser);
        confirmDeleteBtn.hasListener = true;
    }
}

function setupAdminEventListeners() {
    document.getElementById('resetAllTablesBtn').addEventListener('click', resetAllTables);
    document.getElementById('clearAllDataBtn').addEventListener('click', clearAllData);
    document.getElementById('addTableBtn').addEventListener('click', addNewTable);
    document.getElementById('saveTableChanges').addEventListener('click', saveTableChanges);

    // Data tabs
    document.querySelectorAll('.admin-data-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            document.querySelectorAll('.admin-data-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-data-tab-content').forEach(content => content.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(`${tab}View`).classList.add('active');
            displayAdminDataTab(tab);
        });
    });
}

function displayAdminDataTabs() {
    displayAdminDataTab('bookings');
}

function displayAdminDataTab(tab) {
    if (tab === 'bookings') {
        displayBookingsTable();
    } else if (tab === 'users') {
        displayUsersTable();
    } else if (tab === 'tables') {
        displayTablesTable();
    }
}

function displayBookingsTable() {
    const container = document.getElementById('adminBookingsTable');
    let allBookings = [];

    tables.forEach(table => {
        table.bookings.forEach(booking => {
            allBookings.push({
                tableId: table.id,
                ...booking
            });
        });
    });

    if (allBookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No bookings found.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Table</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Seats</th>
                    <th>Purpose</th>
                    <th>Booked At</th>
                </tr>
            </thead>
            <tbody>
    `;

    allBookings.forEach(booking => {
        html += `
            <tr>
                <td><strong>Table ${booking.tableId}</strong></td>
                <td>${booking.name}</td>
                <td>${booking.email}</td>
                <td>${booking.seats}</td>
                <td>${booking.purpose || 'N/A'}</td>
                <td>${new Date(booking.timestamp).toLocaleString()}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function displayUsersTable() {
    const container = document.getElementById('adminUsersTable');

    if (users.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No user accounts found.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Bookings</th>
                    <th>Created At</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    users.forEach(user => {
        const userBookings = tables.reduce((sum, table) => {
            return sum + table.bookings.filter(b => b.email === user.email).length;
        }, 0);

        html += `
            <tr>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>${userBookings}</td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="openDeleteUserModal('${user.id}', '${user.name}', '${user.email}')">Delete</button>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function displayTablesTable() {
    const container = document.getElementById('adminTablesTable');

    if (tables.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: #6b7280;">No tables found.</p>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Table #</th>
                    <th>Capacity</th>
                    <th>Booked</th>
                    <th>Available</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;

    tables.forEach(table => {
        const availableSeats = table.capacity - table.booked;
        const status = table.booked === 0 ? 'available' : 'occupied';
        const statusText = table.booked === 0 ? 'Available' : 'Occupied';

        html += `
            <tr>
                <td><strong>Table ${table.id}</strong></td>
                <td>${table.capacity}</td>
                <td>${table.booked}</td>
                <td>${availableSeats}</td>
                <td><span class="status-badge ${status}">${statusText}</span></td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}

function openDeleteUserModal(userId, userName, userEmail) {
    selectedUserForDeletion = { id: userId, name: userName, email: userEmail };
    document.getElementById('deleteUserName').textContent = `${userName} (${userEmail})`;
    document.getElementById('deleteUserModal').classList.add('show');
}

function confirmDeleteUser() {
    if (!selectedUserForDeletion) return;

    // Remove user
    users = users.filter(u => u.id != selectedUserForDeletion.id);
    saveUsers();

    // Remove all bookings for this user across all tables
    tables.forEach(table => {
        table.bookings = table.bookings.filter(b => b.email !== selectedUserForDeletion.email);
        // Update booked count
        table.booked = table.bookings.reduce((sum, b) => sum + b.seats, 0);
    });
    saveData();

    // Close modal and refresh displays
    document.getElementById('deleteUserModal').classList.remove('show');
    displayUsersTable();
    updateStatistics();
    updateAdminStats();
    showSuccessNotification(`✓ User account and all associated bookings have been deleted!`);
}

function renderTables() {
    const grid = document.getElementById('tablesGrid');
    grid.innerHTML = '';

    const filteredTables = tables.filter(table => {
        if (currentFilter === 'available') return table.booked === 0;
        if (currentFilter === 'occupied') return table.booked > 0;
        return true;
    });

    if (filteredTables.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #6b7280;">No tables found matching the selected filter.</div>';
        return;
    }

    filteredTables.forEach(table => {
        const availableSeats = table.capacity - table.booked;
        const isAvailable = table.booked === 0;
        const status = isAvailable ? 'available' : 'occupied';

        const card = document.createElement('div');
        card.className = `table-card ${status}`;
        card.innerHTML = `
            <div class="table-header">
                <span class="table-number">Table ${table.id}</span>
                <span class="table-icon">${isAvailable ? '✓' : '✕'}</span>
            </div>
            
            <span class="status-badge ${status}">
                ${isAvailable ? 'Available' : 'Occupied'}
            </span>

            <div class="table-info">
                <div class="table-info-item">
                    <span class="table-info-label">Capacity:</span>
                    <span class="table-info-value table-capacity">${table.capacity} seats</span>
                </div>
                <div class="table-info-item">
                    <span class="table-info-label">Booked:</span>
                    <span class="table-info-value table-booked">${table.booked} seats</span>
                </div>
                <div class="table-info-item">
                    <span class="table-info-label">Available:</span>
                    <span class="table-info-value table-available">${availableSeats} seats</span>
                </div>
            </div>

            <div class="table-actions">
                <button class="btn btn-primary book-table-btn" data-table-id="${table.id}" ${!isAvailable ? 'disabled' : ''} style="cursor: ${isAvailable ? 'pointer' : 'not-allowed'};">
                    ${isAvailable ? 'Book Table' : 'Fully Booked'}
                </button>
                <button class="btn btn-secondary details-table-btn" data-table-id="${table.id}" style="cursor: pointer;">Details</button>
            </div>
        `;

        grid.appendChild(card);
    });

    // Attach event listeners after rendering
    attachTableButtonListeners();
}

function attachTableButtonListeners() {
    // Book table buttons
    document.querySelectorAll('.book-table-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (!btn.disabled) {
                const tableId = parseInt(this.getAttribute('data-table-id'));
                openBookingModal(tableId);
            }
        });
    });

    // Details buttons
    document.querySelectorAll('.details-table-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const tableId = parseInt(this.getAttribute('data-table-id'));
            openDetailsModal(tableId);
        });
    });
}

function openBookingModal(tableId) {
    selectedTableId = tableId;
    const table = tables.find(t => t.id === tableId);
    
    if (!table) {
        alert('Table not found');
        return;
    }

    const availableSeats = table.capacity - table.booked;

    // Update modal header
    document.getElementById('tableNumber').textContent = tableId;
    
    // Update modal info (if these elements exist)
    const capacityEl = document.getElementById('modalCapacity');
    const availableEl = document.getElementById('modalAvailable');
    if (capacityEl) capacityEl.textContent = table.capacity;
    if (availableEl) availableEl.textContent = availableSeats;

    // Set max seats and current value
    const seatsInput = document.getElementById('bookingSeatsNeeded');
    seatsInput.max = availableSeats;
    seatsInput.value = 1;

    // Clear form fields
    document.getElementById('bookingUserName').value = '';
    document.getElementById('bookingUserEmail').value = '';
    document.getElementById('bookingPurpose').value = '';

    // Show modal
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('show');
    } else {
        alert('Booking modal not found');
    }
}

function openDetailsModal(tableId) {
    selectedTableId = tableId;
    const table = tables.find(t => t.id === tableId);
    const availableSeats = table.capacity - table.booked;
    const status = table.booked === 0 ? 'Available' : 'Occupied';

    document.getElementById('detailsTableNumber').textContent = tableId;
    document.getElementById('detailsStatus').textContent = status;
    document.getElementById('detailsCapacity').textContent = `${table.capacity}`;
    document.getElementById('detailsAvailableSeats').textContent = `${availableSeats}`;
    document.getElementById('detailsBookedSeats').textContent = `${table.booked}`;

    // Display bookings
    const bookingsList = document.getElementById('bookingsList');
    if (table.bookings.length > 0) {
        bookingsList.innerHTML = '<h4 style="margin-top: 20px; margin-bottom: 15px; color: #1f2937;">Current Bookings:</h4>';
        table.bookings.forEach((booking, index) => {
            const bookingItem = document.createElement('div');
            bookingItem.className = 'booking-item';
            bookingItem.innerHTML = `
                <div class="booking-item-title">${booking.name}</div>
                <div class="booking-item-info">📧 ${booking.email}</div>
                <div class="booking-item-info">👥 ${booking.seats} seat(s)</div>
                <div class="booking-item-info">📝 ${booking.purpose || 'No notes'}</div>
                <div class="booking-item-info">⏰ Booked at: ${new Date(booking.timestamp).toLocaleString()}</div>
            `;
            bookingsList.appendChild(bookingItem);
        });
    } else {
        bookingsList.innerHTML = '<p style="color: #6b7280; font-style: italic;">No active bookings for this table.</p>';
    }

    // Show/hide release button
    const releaseBtn = document.getElementById('releaseTableBtn');
    const editBtn = document.getElementById('editTableBtn');
    
    if (table.booked > 0) {
        releaseBtn.style.display = 'block';
    } else {
        releaseBtn.style.display = 'none';
    }

    if (isAdmin) {
        editBtn.style.display = 'block';
        editBtn.addEventListener('click', () => openEditTableModal(tableId));
    } else {
        editBtn.style.display = 'none';
    }

    document.getElementById('detailsModal').classList.add('show');
}

function openEditTableModal(tableId) {
    const table = tables.find(t => t.id === tableId);
    document.getElementById('editTableNumber').textContent = tableId;
    document.getElementById('editTableCapacity').value = table.capacity;
    document.getElementById('editTableBooked').value = table.booked;
    document.getElementById('editTableStatus').value = table.booked === 0 ? 'available' : 'occupied';
    
    selectedTableId = tableId;
    document.getElementById('editTableModal').classList.add('show');
}

function saveTableChanges() {
    const table = tables.find(t => t.id === selectedTableId);
    const newCapacity = parseInt(document.getElementById('editTableCapacity').value);
    const newBooked = parseInt(document.getElementById('editTableBooked').value);

    if (newCapacity < newBooked) {
        alert('Capacity cannot be less than booked seats');
        return;
    }

    table.capacity = newCapacity;
    table.booked = newBooked;

    saveData();
    renderTables();
    updateStatistics();
    updateAdminStats();
    displayTablesTable();
    document.getElementById('editTableModal').classList.remove('show');
    showSuccessNotification('✓ Table updated successfully!');
}

function confirmBooking() {
    const name = document.getElementById('bookingUserName').value.trim();
    const email = document.getElementById('bookingUserEmail').value.trim();
    const seats = parseInt(document.getElementById('bookingSeatsNeeded').value);
    const purpose = document.getElementById('bookingPurpose').value.trim();

    // Validate all required fields
    if (!name) {
        alert('Please enter your name.');
        return;
    }
    if (!email) {
        alert('Please enter your email.');
        return;
    }
    if (!document.getElementById('bookingSeatsNeeded').value || seats < 1) {
        alert('Please enter number of seats (minimum 1).');
        return;
    }

    const table = tables.find(t => t.id === selectedTableId);
    const availableSeats = table.capacity - table.booked;

    if (seats > availableSeats) {
        alert(`Not enough available seats. Only ${availableSeats} seat(s) available.`);
        return;
    }

    // Add booking
    table.booked += seats;
    table.bookings.push({
        name: name,
        email: email,
        seats: seats,
        purpose: purpose,
        timestamp: new Date().toISOString()
    });

    saveData();
    renderTables();
    updateStatistics();
    if (isAdmin) updateAdminStats();

    // Close modal and show success message
    document.getElementById('bookingModal').classList.remove('show');
    showSuccessNotification(`✓ Table ${selectedTableId} booked successfully for ${name}!`);
}

function releaseTable() {
    if (confirm('Are you sure you want to mark this table as available and clear all bookings?')) {
        const table = tables.find(t => t.id === selectedTableId);
        table.booked = 0;
        table.bookings = [];

        saveData();
        renderTables();
        updateStatistics();
        if (isAdmin) updateAdminStats();
        document.getElementById('detailsModal').classList.remove('show');
        showSuccessNotification(`✓ Table ${selectedTableId} is now available!`);
    }
}

function updateStatistics() {
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.booked === 0).length;
    const occupiedTables = totalTables - availableTables;
    const totalSeatsAvailable = tables.reduce((sum, t) => sum + (t.capacity - t.booked), 0);

    document.getElementById('totalTables').textContent = totalTables;
    document.getElementById('availableTables').textContent = availableTables;
    document.getElementById('occupiedTables').textContent = occupiedTables;
    document.getElementById('totalSeatsAvailable').textContent = totalSeatsAvailable;
}

// Admin Functions
function updateAdminStats() {
    const totalBookings = tables.reduce((sum, t) => sum + t.bookings.length, 0);
    const dataSize = (JSON.stringify(tables).length + JSON.stringify(users).length) / 1024;
    const totalUsers = users.length;

    document.getElementById('totalBookings').textContent = totalBookings;
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('databaseSize').textContent = dataSize.toFixed(2) + ' KB';
}

function resetAllTables() {
    if (confirm('⚠️ This will reset all tables to default state but keep bookings. Are you sure?')) {
        tables = JSON.parse(JSON.stringify(defaultTables));
        
        // Recalculate bookings if needed
        saveData();
        renderTables();
        updateStatistics();
        updateAdminStats();
        displayTablesTable();
        showSuccessNotification('✓ All tables have been reset to default state!');
    }
}

function clearAllData() {
    if (confirm('⚠️ WARNING: This will DELETE ALL DATA including all tables, bookings, and user accounts. This cannot be undone. Are you absolutely sure?')) {
        if (confirm('This is your last chance. Click OK only if you are 100% sure.')) {
            tables = JSON.parse(JSON.stringify(defaultTables));
            users = [];
            saveData();
            saveUsers();
            renderTables();
            updateStatistics();
            updateAdminStats();
            displayAdminDataTabs();
            showSuccessNotification('✓ All data has been cleared!');
        }
    }
}

function addNewTable() {
    const capacity = parseInt(document.getElementById('newTableCapacity').value);

    if (!capacity || capacity < 1 || capacity > 20) {
        alert('Please enter a valid capacity (1-20)');
        return;
    }

    const newTableId = Math.max(...tables.map(t => t.id), 0) + 1;
    const newTable = {
        id: newTableId,
        name: `Table ${newTableId}`,
        capacity: capacity,
        booked: 0,
        bookings: []
    };

    tables.push(newTable);
    saveData();
    renderTables();
    updateStatistics();
    updateAdminStats();
    displayTablesTable();
    document.getElementById('newTableCapacity').value = '4';

    showSuccessNotification(`✓ New table (Table ${newTableId}) added successfully!`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem(USER_STORAGE_KEY);
        currentUser = null;
        isAdmin = false;

        // Reset form
        document.getElementById('userLoginForm').reset();
        document.getElementById('adminLoginForm').reset();

        // Show login page
        document.getElementById('loginPage').classList.add('show');
        document.getElementById('mainApp').classList.add('hidden');

        // Reset to user tab
        document.querySelectorAll('.login-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.login-tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('[data-tab="user"]').classList.add('active');
        document.getElementById('userLoginTab').classList.add('active');
    }
}

function showSuccessNotification(message) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 2000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);
