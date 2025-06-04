/**
 * Medical Appointment Tracker - Main JavaScript
 * 
 * This file contains the main application logic, event handlers,
 * and UI interactions for the Medical Appointment Tracker.
 */

// Global variables
let currentPage = 'dashboard';

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (db.currentUser) {
        showMainContainer();
        updateUserInfo();
        loadDashboard();
    } else {
        showAuthContainer();
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Set up all event listeners
function setupEventListeners() {
    // Authentication event listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navigation event listeners
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo(this.getAttribute('data-page'));
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebarCollapse').addEventListener('click', function() {
        document.getElementById('sidebar').classList.toggle('active');
    });
    
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
    
    // Data management
    document.getElementById('export-data').addEventListener('click', handleExportData);
    document.getElementById('import-data').addEventListener('click', function() {
        $('#importDataModal').modal('show');
    });
    document.getElementById('confirm-import').addEventListener('click', handleImportData);
    document.getElementById('clear-data').addEventListener('click', function() {
        $('#clearDataModal').modal('show');
    });
    document.getElementById('clear-data-confirmation').addEventListener('input', function() {
        document.getElementById('confirm-clear-data').disabled = this.value !== 'DELETE';
    });
    document.getElementById('confirm-clear-data').addEventListener('click', handleClearData);
    
    // Modal save buttons
    document.getElementById('save-appointment').addEventListener('click', handleSaveAppointment);
    document.getElementById('save-doctor').addEventListener('click', handleSaveDoctor);
    document.getElementById('save-medication').addEventListener('click', handleSaveMedication);
    document.getElementById('save-diagnosis').addEventListener('click', handleSaveDiagnosis);
    document.getElementById('save-test-result').addEventListener('click', handleSaveTestResult);
    document.getElementById('save-feedback').addEventListener('click', handleSaveFeedback);
    
    // Search and filter inputs
    document.getElementById('appointment-search').addEventListener('input', filterAppointments);
    document.getElementById('appointment-status-filter').addEventListener('change', filterAppointments);
    document.getElementById('appointment-sort').addEventListener('change', filterAppointments);
    
    document.getElementById('medication-search').addEventListener('input', filterMedications);
    document.getElementById('medication-status-filter').addEventListener('change', filterMedications);
    document.getElementById('medication-sort').addEventListener('change', filterMedications);
    
    document.getElementById('diagnosis-search').addEventListener('input', filterDiagnoses);
    document.getElementById('diagnosis-status-filter').addEventListener('change', filterDiagnoses);
    document.getElementById('diagnosis-sort').addEventListener('change', filterDiagnoses);
    
    document.getElementById('test-result-search').addEventListener('input', filterTestResults);
    document.getElementById('test-result-type-filter').addEventListener('change', filterTestResults);
    document.getElementById('test-result-sort').addEventListener('change', filterTestResults);
}

// Authentication Functions

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const result = db.loginUser(username, password);
    
    if (result.success) {
        showMainContainer();
        updateUserInfo();
        loadDashboard();
        showAlert('Login successful!', 'success');
    } else {
        showAlert(result.message || 'Login failed. Please check your credentials.', 'danger');
    }
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const firstName = document.getElementById('register-first-name').value;
    const lastName = document.getElementById('register-last-name').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showAlert('Passwords do not match.', 'danger');
        return;
    }
    
    const result = db.registerUser(username, email, firstName, lastName, password);
    
    if (result.success) {
        showMainContainer();
        updateUserInfo();
        loadDashboard();
        showAlert('Registration successful! Welcome to Medical Appointment Tracker.', 'success');
    } else {
        showAlert(result.message || 'Registration failed. Please try again.', 'danger');
    }
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    db.logoutUser();
    showAuthContainer();
    showAlert('You have been logged out.', 'info');
}

// Handle profile update
function handleProfileUpdate(e) {
    e.preventDefault();
    
    const email = document.getElementById('profile-email').value;
    const firstName = document.getElementById('profile-first-name').value;
    const lastName = document.getElementById('profile-last-name').value;
    
    const result = db.updateUserProfile(email, firstName, lastName);
    
    if (result.success) {
        updateUserInfo();
        showAlert('Profile updated successfully!', 'success');
    } else {
        showAlert(result.message || 'Failed to update profile.', 'danger');
    }
}

// Handle password change
function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    // Validate passwords match
    if (newPassword !== confirmNewPassword) {
        showAlert('New passwords do not match.', 'danger');
        return;
    }
    
    const result = db.changePassword(currentPassword, newPassword);
    
    if (result.success) {
        document.getElementById('password-form').reset();
        showAlert('Password changed successfully!', 'success');
    } else {
        showAlert(result.message || 'Failed to change password.', 'danger');
    }
}

// Data Management Functions

// Handle export data
function handleExportData() {
    const data = db.exportData();
    
    if (!data) {
        showAlert('No data to export.', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'medical_tracker_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showAlert('Data exported successfully!', 'success');
}

// Handle import data
function handleImportData() {
    const fileInput = document.getElementById('import-data-file');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showAlert('Please select a file to import.', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            const result = db.importData(data);
            
            if (result) {
                $('#importDataModal').modal('hide');
                loadDashboard();
                showAlert('Data imported successfully!', 'success');
            } else {
                showAlert('Failed to import data.', 'danger');
            }
        } catch (error) {
            showAlert('Invalid data format.', 'danger');
        }
    };
    
    reader.readAsText(file);
}

// Handle clear data
function handleClearData() {
    const confirmation = document.getElementById('clear-data-confirmation').value;
    
    if (confirmation !== 'DELETE') {
        showAlert('Please type DELETE to confirm.', 'warning');
        return;
    }
    
    db.clearDatabase();
    $('#clearDataModal').modal('hide');
    loadDashboard();
    showAlert('All data has been cleared.', 'success');
}

// Navigation Functions

// Show auth container and hide main container
function showAuthContainer() {
    document.getElementById('auth-container').classList.remove('d-none');
    document.getElementById('main-container').classList.add('d-none');
}

// Show main container and hide auth container
function showMainContainer() {
    document.getElementById('auth-container').classList.add('d-none');
    document.getElementById('main-container').classList.remove('d-none');
}

// Navigate to a specific page
function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.content-page').forEach(p => p.classList.add('d-none'));
    
    // Show selected page
    document.getElementById(`${page}-page`).classList.remove('d-none');
    
    // Update active state in sidebar
    document.querySelectorAll('#sidebar .list-unstyled li').forEach(li => li.classList.remove('active'));
    document.querySelector(`#sidebar .list-unstyled li a[data-page="${page}"]`).parentElement.classList.add('active');
    
    // Update current page
    currentPage = page;
    
    // Load page data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'doctors':
            loadDoctors();
            break;
        case 'medications':
            loadMedications();
            break;
        case 'diagnoses':
            loadDiagnoses();
            break;
        case 'test-results':
            loadTestResults();
            break;
        case 'medical-feedback':
            loadMedicalFeedback();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Update user info in the UI
function updateUserInfo() {
    if (!db.currentUser) return;
    
    const fullName = `${db.currentUser.firstName || ''} ${db.currentUser.lastName || ''}`.trim();
    document.getElementById('user-name').textContent = `Welcome, ${fullName || db.currentUser.username}`;
}

// Utility Functions

// Show alert message
function showAlert(message, type = 'info') {
    // Create alert container if it doesn't exist
    let alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show custom-alert`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add alert to container
    alertContainer.appendChild(alertElement);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => alertElement.remove(), 300);
    }, 5000);
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Format time for display
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Create empty state element
function createEmptyState(message, icon = 'bi-inbox') {
    return `
        <div class="empty-state">
            <i class="bi ${icon}"></i>
            <h4>Nothing to show</h4>
            <p>${message}</p>
        </div>
    `;
}

// Reset a modal form
function resetModalForm(formId) {
    document.getElementById(formId).reset();
    document.getElementById(`${formId}-id`).value = '';
}

// Populate doctor select options
function populateDoctorOptions(selectId) {
    const select = document.getElementById(selectId);
    const doctors = db.getUserDoctors();
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add doctor options
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        select.appendChild(option);
    });
}

// Populate appointment select options
function populateAppointmentOptions(selectId) {
    const select = document.getElementById(selectId);
    const appointments = db.getUserAppointments();
    
    // Clear existing options except the first one
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // Add appointment options
    appointments.forEach(appointment => {
        const option = document.createElement('option');
        option.value = appointment.id;
        option.textContent = `${appointment.title} (${formatDate(appointment.date)})`;
        select.appendChild(option);
    });
}

// CRUD Operations for Appointments

// Handle save appointment
function handleSaveAppointment() {
    const id = document.getElementById('appointment-id').value;
    const title = document.getElementById('appointment-title').value;
    const doctorId = document.getElementById('appointment-doctor').value || null;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('appointment-time').value;
    const duration = document.getElementById('appointment-duration').value;
    const type = document.getElementById('appointment-type').value;
    const location = document.getElementById('appointment-location').value;
    const status = document.getElementById('appointment-status').value;
    const reminder = document.getElementById('appointment-reminder').checked;
    const notes = document.getElementById('appointment-notes').value;
    
    // Combine date and time
    const dateTime = date && time ? `${date}T${time}` : date;
    
    const appointmentData = {
        title,
        doctorId,
        date: dateTime,
        duration,
        type,
        location,
        status,
        reminder,
        notes
    };
    
    let result;
    
    if (id) {
        // Update existing appointment
        result = db.updateAppointment(id, appointmentData);
    } else {
        // Add new appointment
        result = db.addAppointment(appointmentData);
    }
    
    if (result.success) {
        $('#appointmentModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'appointments') {
            loadAppointments();
        }
        
        showAlert(`Appointment ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} appointment.`, 'danger');
    }
}

// Edit appointment
function editAppointment(id) {
    const appointment = db.getAppointmentById(id);
    
    if (!appointment) {
        showAlert('Appointment not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('appointment-id').value = appointment.id;
    document.getElementById('appointment-title').value = appointment.title || '';
    document.getElementById('appointment-doctor').value = appointment.doctorId || '';
    
    // Handle date and time
    if (appointment.date) {
        const dateObj = new Date(appointment.date);
        document.getElementById('appointment-date').value = dateObj.toISOString().split('T')[0];
        document.getElementById('appointment-time').value = dateObj.toTimeString().substring(0, 5);
    } else {
        document.getElementById('appointment-date').value = '';
        document.getElementById('appointment-time').value = '';
    }
    
    document.getElementById('appointment-duration').value = appointment.duration || 30;
    document.getElementById('appointment-type').value = appointment.type || 'regular checkup';
    document.getElementById('appointment-location').value = appointment.location || '';
    document.getElementById('appointment-status').value = appointment.status || 'scheduled';
    document.getElementById('appointment-reminder').checked = appointment.reminder || false;
    document.getElementById('appointment-notes').value = appointment.notes || '';
    
    // Update modal title
    document.getElementById('appointmentModalLabel').textContent = 'Edit Appointment';
    
    // Show modal
    $('#appointmentModal').modal('show');
}

// Delete appointment
function deleteAppointment(id) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        const result = db.deleteAppointment(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'appointments') {
                loadAppointments();
            }
            
            showAlert('Appointment deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete appointment.', 'danger');
        }
    }
}

// Filter appointments
function filterAppointments() {
    const searchTerm = document.getElementById('appointment-search').value.toLowerCase();
    const statusFilter = document.getElementById('appointment-status-filter').value;
    const sortOption = document.getElementById('appointment-sort').value;
    
    let appointments = db.getUserAppointments();
    
    // Apply status filter
    if (statusFilter !== 'all') {
        appointments = appointments.filter(a => a.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        appointments = appointments.filter(a => 
            a.title.toLowerCase().includes(searchTerm) || 
            (a.location && a.location.toLowerCase().includes(searchTerm)) ||
            (a.notes && a.notes.toLowerCase().includes(searchTerm)) ||
            (a.doctorId && db.getDoctorName(a.doctorId).toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply sorting
    switch (sortOption) {
        case 'date-asc':
            appointments.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'date-desc':
            appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'title-asc':
            appointments.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            appointments.sort((a, b) => b.title.localeCompare(a.title));
            break;
    }
    
    // Render filtered appointments
    renderAppointmentsTable(appointments);
}

// CRUD Operations for Doctors

// Handle save doctor
function handleSaveDoctor() {
    const id = document.getElementById('doctor-id').value;
    const name = document.getElementById('doctor-name').value;
    const specialty = document.getElementById('doctor-specialty').value;
    const phone = document.getElementById('doctor-phone').value;
    const email = document.getElementById('doctor-email').value;
    const address = document.getElementById('doctor-address').value;
    const hours = document.getElementById('doctor-hours').value;
    const contact = document.getElementById('doctor-contact').value;
    const notes = document.getElementById('doctor-notes').value;
    
    const doctorData = {
        name,
        specialty,
        phone,
        email,
        address,
        hours,
        contact,
        notes
    };
    
    let result;
    
    if (id) {
        // Update existing doctor
        result = db.updateDoctor(id, doctorData);
    } else {
        // Add new doctor
        result = db.addDoctor(doctorData);
    }
    
    if (result.success) {
        $('#doctorModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'doctors') {
            loadDoctors();
        }
        
        // Update doctor select options in other forms
        populateDoctorOptions('appointment-doctor');
        populateDoctorOptions('diagnosis-doctor');
        populateDoctorOptions('test-result-doctor');
        
        showAlert(`Doctor ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} doctor.`, 'danger');
    }
}

// Edit doctor
function editDoctor(id) {
    const doctor = db.getDoctorById(id);
    
    if (!doctor) {
        showAlert('Doctor not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('doctor-id').value = doctor.id;
    document.getElementById('doctor-name').value = doctor.name || '';
    document.getElementById('doctor-specialty').value = doctor.specialty || '';
    document.getElementById('doctor-phone').value = doctor.phone || '';
    document.getElementById('doctor-email').value = doctor.email || '';
    document.getElementById('doctor-address').value = doctor.address || '';
    document.getElementById('doctor-hours').value = doctor.hours || '';
    document.getElementById('doctor-contact').value = doctor.contact || '';
    document.getElementById('doctor-notes').value = doctor.notes || '';
    
    // Update modal title
    document.getElementById('doctorModalLabel').textContent = 'Edit Doctor';
    
    // Show modal
    $('#doctorModal').modal('show');
}

// Delete doctor
function deleteDoctor(id) {
    if (confirm('Are you sure you want to delete this doctor?')) {
        const result = db.deleteDoctor(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'doctors') {
                loadDoctors();
            }
            
            showAlert('Doctor deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete doctor.', 'danger');
        }
    }
}

// CRUD Operations for Medications

// Handle save medication
function handleSaveMedication() {
    const id = document.getElementById('medication-id').value;
    const name = document.getElementById('medication-name').value;
    const dosage = document.getElementById('medication-dosage').value;
    const frequency = document.getElementById('medication-frequency').value;
    const startDate = document.getElementById('medication-start-date').value;
    const endDate = document.getElementById('medication-end-date').value;
    const status = document.getElementById('medication-status').value;
    const notes = document.getElementById('medication-notes').value;
    
    const medicationData = {
        name,
        dosage,
        frequency,
        startDate,
        endDate,
        status,
        notes
    };
    
    let result;
    
    if (id) {
        // Update existing medication
        result = db.updateMedication(id, medicationData);
    } else {
        // Add new medication
        result = db.addMedication(medicationData);
    }
    
    if (result.success) {
        $('#medicationModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'medications') {
            loadMedications();
        }
        
        showAlert(`Medication ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} medication.`, 'danger');
    }
}

// Edit medication
function editMedication(id) {
    const medication = db.getMedicationById(id);
    
    if (!medication) {
        showAlert('Medication not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('medication-id').value = medication.id;
    document.getElementById('medication-name').value = medication.name || '';
    document.getElementById('medication-dosage').value = medication.dosage || '';
    document.getElementById('medication-frequency').value = medication.frequency || '';
    document.getElementById('medication-start-date').value = medication.startDate || '';
    document.getElementById('medication-end-date').value = medication.endDate || '';
    document.getElementById('medication-status').value = medication.status || 'active';
    document.getElementById('medication-notes').value = medication.notes || '';
    
    // Update modal title
    document.getElementById('medicationModalLabel').textContent = 'Edit Medication';
    
    // Show modal
    $('#medicationModal').modal('show');
}

// Delete medication
function deleteMedication(id) {
    if (confirm('Are you sure you want to delete this medication?')) {
        const result = db.deleteMedication(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'medications') {
                loadMedications();
            }
            
            showAlert('Medication deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete medication.', 'danger');
        }
    }
}

// Filter medications
function filterMedications() {
    const searchTerm = document.getElementById('medication-search').value.toLowerCase();
    const statusFilter = document.getElementById('medication-status-filter').value;
    const sortOption = document.getElementById('medication-sort').value;
    
    let medications = db.getUserMedications();
    
    // Apply status filter
    if (statusFilter !== 'all') {
        medications = medications.filter(m => m.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        medications = medications.filter(m => 
            m.name.toLowerCase().includes(searchTerm) || 
            (m.dosage && m.dosage.toLowerCase().includes(searchTerm)) ||
            (m.frequency && m.frequency.toLowerCase().includes(searchTerm)) ||
            (m.notes && m.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply sorting
    switch (sortOption) {
        case 'name-asc':
            medications.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            medications.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-asc':
            medications.sort((a, b) => new Date(a.startDate || a.createdAt) - new Date(b.startDate || b.createdAt));
            break;
        case 'date-desc':
            medications.sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));
            break;
    }
    
    // Render filtered medications
    renderMedicationsTable(medications);
}

// CRUD Operations for Diagnoses

// Handle save diagnosis
function handleSaveDiagnosis() {
    const id = document.getElementById('diagnosis-id').value;
    const condition = document.getElementById('diagnosis-condition').value;
    const diagnosisDate = document.getElementById('diagnosis-date').value;
    const doctorId = document.getElementById('diagnosis-doctor').value || null;
    const status = document.getElementById('diagnosis-status').value;
    const severity = document.getElementById('diagnosis-severity').value;
    const notes = document.getElementById('diagnosis-notes').value;
    
    const diagnosisData = {
        condition,
        diagnosisDate,
        doctorId,
        status,
        severity,
        notes
    };
    
    let result;
    
    if (id) {
        // Update existing diagnosis
        result = db.updateDiagnosis(id, diagnosisData);
    } else {
        // Add new diagnosis
        result = db.addDiagnosis(diagnosisData);
    }
    
    if (result.success) {
        $('#diagnosisModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'diagnoses') {
            loadDiagnoses();
        }
        
        showAlert(`Diagnosis ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} diagnosis.`, 'danger');
    }
}

// Edit diagnosis
function editDiagnosis(id) {
    const diagnosis = db.getDiagnosisById(id);
    
    if (!diagnosis) {
        showAlert('Diagnosis not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('diagnosis-id').value = diagnosis.id;
    document.getElementById('diagnosis-condition').value = diagnosis.condition || '';
    document.getElementById('diagnosis-date').value = diagnosis.diagnosisDate || '';
    document.getElementById('diagnosis-doctor').value = diagnosis.doctorId || '';
    document.getElementById('diagnosis-status').value = diagnosis.status || 'active';
    document.getElementById('diagnosis-severity').value = diagnosis.severity || 'mild';
    document.getElementById('diagnosis-notes').value = diagnosis.notes || '';
    
    // Update modal title
    document.getElementById('diagnosisModalLabel').textContent = 'Edit Diagnosis';
    
    // Show modal
    $('#diagnosisModal').modal('show');
}

// Delete diagnosis
function deleteDiagnosis(id) {
    if (confirm('Are you sure you want to delete this diagnosis?')) {
        const result = db.deleteDiagnosis(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'diagnoses') {
                loadDiagnoses();
            }
            
            showAlert('Diagnosis deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete diagnosis.', 'danger');
        }
    }
}

// Filter diagnoses
function filterDiagnoses() {
    const searchTerm = document.getElementById('diagnosis-search').value.toLowerCase();
    const statusFilter = document.getElementById('diagnosis-status-filter').value;
    const sortOption = document.getElementById('diagnosis-sort').value;
    
    let diagnoses = db.getUserDiagnoses();
    
    // Apply status filter
    if (statusFilter !== 'all') {
        diagnoses = diagnoses.filter(d => d.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        diagnoses = diagnoses.filter(d => 
            d.condition.toLowerCase().includes(searchTerm) || 
            (d.notes && d.notes.toLowerCase().includes(searchTerm)) ||
            (d.doctorId && db.getDoctorName(d.doctorId).toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply sorting
    switch (sortOption) {
        case 'condition-asc':
            diagnoses.sort((a, b) => a.condition.localeCompare(b.condition));
            break;
        case 'condition-desc':
            diagnoses.sort((a, b) => b.condition.localeCompare(a.condition));
            break;
        case 'date-asc':
            diagnoses.sort((a, b) => new Date(a.diagnosisDate || a.createdAt) - new Date(b.diagnosisDate || b.createdAt));
            break;
        case 'date-desc':
            diagnoses.sort((a, b) => new Date(b.diagnosisDate || b.createdAt) - new Date(a.diagnosisDate || a.createdAt));
            break;
    }
    
    // Render filtered diagnoses
    renderDiagnosesTable(diagnoses);
}

// CRUD Operations for Test Results

// Handle save test result
function handleSaveTestResult() {
    const id = document.getElementById('test-result-id').value;
    const testName = document.getElementById('test-result-name').value;
    const testType = document.getElementById('test-result-type').value;
    const testDate = document.getElementById('test-result-date').value;
    const doctorId = document.getElementById('test-result-doctor').value || null;
    const status = document.getElementById('test-result-status').value;
    const results = document.getElementById('test-result-results').value;
    
    const testResultData = {
        testName,
        testType,
        testDate,
        doctorId,
        status,
        results
    };
    
    let result;
    
    if (id) {
        // Update existing test result
        result = db.updateTestResult(id, testResultData);
    } else {
        // Add new test result
        result = db.addTestResult(testResultData);
    }
    
    if (result.success) {
        $('#testResultModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'test-results') {
            loadTestResults();
        }
        
        showAlert(`Test result ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} test result.`, 'danger');
    }
}

// Edit test result
function editTestResult(id) {
    const testResult = db.getTestResultById(id);
    
    if (!testResult) {
        showAlert('Test result not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('test-result-id').value = testResult.id;
    document.getElementById('test-result-name').value = testResult.testName || '';
    document.getElementById('test-result-type').value = testResult.testType || 'Blood Test';
    document.getElementById('test-result-date').value = testResult.testDate || '';
    document.getElementById('test-result-doctor').value = testResult.doctorId || '';
    document.getElementById('test-result-status').value = testResult.status || 'pending';
    document.getElementById('test-result-results').value = testResult.results || '';
    
    // Update modal title
    document.getElementById('testResultModalLabel').textContent = 'Edit Test Result';
    
    // Show modal
    $('#testResultModal').modal('show');
}

// Delete test result
function deleteTestResult(id) {
    if (confirm('Are you sure you want to delete this test result?')) {
        const result = db.deleteTestResult(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'test-results') {
                loadTestResults();
            }
            
            showAlert('Test result deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete test result.', 'danger');
        }
    }
}

// Filter test results
function filterTestResults() {
    const searchTerm = document.getElementById('test-result-search').value.toLowerCase();
    const typeFilter = document.getElementById('test-result-type-filter').value;
    const sortOption = document.getElementById('test-result-sort').value;
    
    let testResults = db.getUserTestResults();
    
    // Apply type filter
    if (typeFilter !== 'all') {
        testResults = testResults.filter(t => t.testType === typeFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
        testResults = testResults.filter(t => 
            t.testName.toLowerCase().includes(searchTerm) || 
            (t.results && t.results.toLowerCase().includes(searchTerm)) ||
            (t.doctorId && db.getDoctorName(t.doctorId).toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply sorting
    switch (sortOption) {
        case 'name-asc':
            testResults.sort((a, b) => a.testName.localeCompare(b.testName));
            break;
        case 'name-desc':
            testResults.sort((a, b) => b.testName.localeCompare(a.testName));
            break;
        case 'date-asc':
            testResults.sort((a, b) => new Date(a.testDate || a.createdAt) - new Date(b.testDate || b.createdAt));
            break;
        case 'date-desc':
            testResults.sort((a, b) => new Date(b.testDate || b.createdAt) - new Date(a.testDate || a.createdAt));
            break;
    }
    
    // Render filtered test results
    renderTestResultsTable(testResults);
}

// CRUD Operations for Medical Feedback

// Handle save feedback
function handleSaveFeedback() {
    const id = document.getElementById('feedback-id').value;
    const appointmentId = document.getElementById('feedback-appointment').value || null;
    const notes = document.getElementById('feedback-notes').value;
    
    const feedbackData = {
        appointmentId,
        notes
    };
    
    let result;
    
    if (id) {
        // Update existing feedback
        result = db.updateMedicalFeedback(id, feedbackData);
    } else {
        // Add new feedback
        result = db.addMedicalFeedback(feedbackData);
    }
    
    if (result.success) {
        $('#feedbackModal').modal('hide');
        
        if (currentPage === 'dashboard') {
            loadDashboard();
        } else if (currentPage === 'medical-feedback') {
            loadMedicalFeedback();
        }
        
        showAlert(`Medical feedback ${id ? 'updated' : 'added'} successfully!`, 'success');
    } else {
        showAlert(result.message || `Failed to ${id ? 'update' : 'add'} medical feedback.`, 'danger');
    }
}

// Edit feedback
function editFeedback(id) {
    const feedback = db.getMedicalFeedbackById(id);
    
    if (!feedback) {
        showAlert('Medical feedback not found.', 'danger');
        return;
    }
    
    // Populate form fields
    document.getElementById('feedback-id').value = feedback.id;
    document.getElementById('feedback-appointment').value = feedback.appointmentId || '';
    document.getElementById('feedback-notes').value = feedback.notes || '';
    
    // Update modal title
    document.getElementById('feedbackModalLabel').textContent = 'Edit Medical Feedback';
    
    // Show modal
    $('#feedbackModal').modal('show');
}

// Delete feedback
function deleteFeedback(id) {
    if (confirm('Are you sure you want to delete this medical feedback?')) {
        const result = db.deleteMedicalFeedback(id);
        
        if (result.success) {
            if (currentPage === 'dashboard') {
                loadDashboard();
            } else if (currentPage === 'medical-feedback') {
                loadMedicalFeedback();
            }
            
            showAlert('Medical feedback deleted successfully!', 'success');
        } else {
            showAlert(result.message || 'Failed to delete medical feedback.', 'danger');
        }
    }
}

// Modal preparation functions

// Prepare appointment modal for adding new appointment
function prepareNewAppointmentModal() {
    resetModalForm('appointment-form');
    document.getElementById('appointmentModalLabel').textContent = 'Add Appointment';
    populateDoctorOptions('appointment-doctor');
    $('#appointmentModal').modal('show');
}

// Prepare doctor modal for adding new doctor
function prepareNewDoctorModal() {
    resetModalForm('doctor-form');
    document.getElementById('doctorModalLabel').textContent = 'Add Doctor';
    $('#doctorModal').modal('show');
}

// Prepare medication modal for adding new medication
function prepareNewMedicationModal() {
    resetModalForm('medication-form');
    document.getElementById('medicationModalLabel').textContent = 'Add Medication';
    $('#medicationModal').modal('show');
}

// Prepare diagnosis modal for adding new diagnosis
function prepareNewDiagnosisModal() {
    resetModalForm('diagnosis-form');
    document.getElementById('diagnosisModalLabel').textContent = 'Add Diagnosis';
    populateDoctorOptions('diagnosis-doctor');
    $('#diagnosisModal').modal('show');
}

// Prepare test result modal for adding new test result
function prepareNewTestResultModal() {
    resetModalForm('test-result-form');
    document.getElementById('testResultModalLabel').textContent = 'Add Test Result';
    populateDoctorOptions('test-result-doctor');
    $('#testResultModal').modal('show');
}

// Prepare feedback modal for adding new feedback
function prepareNewFeedbackModal() {
    resetModalForm('feedback-form');
    document.getElementById('feedbackModalLabel').textContent = 'Add Medical Feedback';
    populateAppointmentOptions('feedback-appointment');
    $('#feedbackModal').modal('show');
}

// Initialize modals when the application starts
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners for "New" buttons
    document.querySelectorAll('[data-bs-target="#appointmentModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewAppointmentModal);
    });
    
    document.querySelectorAll('[data-bs-target="#doctorModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewDoctorModal);
    });
    
    document.querySelectorAll('[data-bs-target="#medicationModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewMedicationModal);
    });
    
    document.querySelectorAll('[data-bs-target="#diagnosisModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewDiagnosisModal);
    });
    
    document.querySelectorAll('[data-bs-target="#testResultModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewTestResultModal);
    });
    
    document.querySelectorAll('[data-bs-target="#feedbackModal"]').forEach(btn => {
        btn.addEventListener('click', prepareNewFeedbackModal);
    });
});
