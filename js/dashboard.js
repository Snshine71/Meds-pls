/**
 * Medical Appointment Tracker - Dashboard and UI Components
 * 
 * This file contains functions for loading and rendering the dashboard
 * and other UI components for the Medical Appointment Tracker.
 */

// Load Dashboard
function loadDashboard() {
    // Load upcoming appointments
    loadDashboardAppointments();
    
    // Load doctor contacts
    loadDashboardDoctors();
    
    // Load current medications
    loadDashboardMedications();
    
    // Load active diagnoses
    loadDashboardDiagnoses();
    
    // Load dashboard summary
    loadDashboardSummary();
}

// Load Dashboard Summary
function loadDashboardSummary() {
    const summaryContainer = document.getElementById('dashboard-summary');
    
    const upcomingAppointments = db.getUpcomingAppointments().length;
    const activeMedications = db.getActiveMedications().length;
    const activeDiagnoses = db.getActiveDiagnoses().length;
    const doctors = db.getUserDoctors().length;
    
    summaryContainer.innerHTML = `
        <div class="row">
            <div class="col-md-3 col-sm-6">
                <div class="summary-item">
                    <i class="bi bi-calendar-check text-primary"></i>
                    <div class="count">${upcomingAppointments}</div>
                    <div class="label">Upcoming Appointments</div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="summary-item">
                    <i class="bi bi-capsule text-success"></i>
                    <div class="count">${activeMedications}</div>
                    <div class="label">Active Medications</div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="summary-item">
                    <i class="bi bi-clipboard2-pulse text-danger"></i>
                    <div class="count">${activeDiagnoses}</div>
                    <div class="label">Active Diagnoses</div>
                </div>
            </div>
            <div class="col-md-3 col-sm-6">
                <div class="summary-item">
                    <i class="bi bi-person-vcard text-info"></i>
                    <div class="count">${doctors}</div>
                    <div class="label">Healthcare Providers</div>
                </div>
            </div>
        </div>
    `;
}

// Load Dashboard Appointments
function loadDashboardAppointments() {
    const container = document.getElementById('dashboard-appointments');
    const appointments = db.getUpcomingAppointments().slice(0, 5); // Get top 5
    
    if (appointments.length === 0) {
        container.innerHTML = createEmptyState('No upcoming appointments', 'bi-calendar');
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    appointments.forEach(appointment => {
        const date = formatDate(appointment.date);
        const time = formatTime(appointment.date);
        const doctorName = db.getDoctorName(appointment.doctorId);
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${appointment.title}</h5>
                    <small>${date} at ${time}</small>
                </div>
                ${doctorName ? `<p class="mb-1">Doctor: ${doctorName}</p>` : ''}
                ${appointment.location ? `<p class="mb-1">Location: ${appointment.location}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="badge bg-${getStatusBadgeColor(appointment.status)}">${appointment.status}</span>
                    <div>
                        <button class="btn btn-sm btn-outline-primary action-btn" onclick="editAppointment('${appointment.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteAppointment('${appointment.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Dashboard Doctors
function loadDashboardDoctors() {
    const container = document.getElementById('dashboard-doctors');
    const doctors = db.getUserDoctors().slice(0, 5); // Get top 5
    
    if (doctors.length === 0) {
        container.innerHTML = createEmptyState('No doctors added', 'bi-person-vcard');
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    doctors.forEach(doctor => {
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${doctor.name}</h5>
                    <small>${doctor.specialty || 'Specialist'}</small>
                </div>
                ${doctor.phone ? `<p class="mb-1"><i class="bi bi-telephone"></i> ${doctor.phone}</p>` : ''}
                ${doctor.email ? `<p class="mb-1"><i class="bi bi-envelope"></i> ${doctor.email}</p>` : ''}
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-sm btn-outline-primary action-btn" onclick="editDoctor('${doctor.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteDoctor('${doctor.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Dashboard Medications
function loadDashboardMedications() {
    const container = document.getElementById('dashboard-medications');
    const medications = db.getActiveMedications().slice(0, 5); // Get top 5
    
    if (medications.length === 0) {
        container.innerHTML = createEmptyState('No active medications', 'bi-capsule');
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    medications.forEach(medication => {
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${medication.name}</h5>
                    <small>${medication.dosage || ''}</small>
                </div>
                ${medication.frequency ? `<p class="mb-1">Frequency: ${medication.frequency}</p>` : ''}
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-sm btn-outline-primary action-btn" onclick="editMedication('${medication.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteMedication('${medication.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Dashboard Diagnoses
function loadDashboardDiagnoses() {
    const container = document.getElementById('dashboard-diagnoses');
    const diagnoses = db.getActiveDiagnoses().slice(0, 5); // Get top 5
    
    if (diagnoses.length === 0) {
        container.innerHTML = createEmptyState('No active diagnoses', 'bi-clipboard2-pulse');
        return;
    }
    
    let html = `
        <div class="list-group">
    `;
    
    diagnoses.forEach(diagnosis => {
        const doctorName = db.getDoctorName(diagnosis.doctorId);
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${diagnosis.condition}</h5>
                    <small>${diagnosis.diagnosisDate ? formatDate(diagnosis.diagnosisDate) : ''}</small>
                </div>
                ${doctorName ? `<p class="mb-1">Doctor: ${doctorName}</p>` : ''}
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <span class="badge bg-${getSeverityBadgeColor(diagnosis.severity)}">${diagnosis.severity || 'Unknown'}</span>
                    <div>
                        <button class="btn btn-sm btn-outline-primary action-btn" onclick="editDiagnosis('${diagnosis.id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger action-btn" onclick="deleteDiagnosis('${diagnosis.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Appointments Page
function loadAppointments() {
    // Populate doctor select options for the modal
    populateDoctorOptions('appointment-doctor');
    
    // Load appointments table
    const appointments = db.getUserAppointments();
    renderAppointmentsTable(appointments);
}

// Render Appointments Table
function renderAppointmentsTable(appointments) {
    const container = document.getElementById('appointments-table-container');
    
    if (appointments.length === 0) {
        container.innerHTML = createEmptyState('No appointments found', 'bi-calendar');
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Doctor</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    appointments.forEach(appointment => {
        const date = formatDate(appointment.date);
        const time = formatTime(appointment.date);
        const doctorName = db.getDoctorName(appointment.doctorId);
        
        html += `
            <tr>
                <td>${appointment.title}</td>
                <td>${date}</td>
                <td>${time}</td>
                <td>${doctorName || '-'}</td>
                <td>${appointment.location || '-'}</td>
                <td><span class="badge bg-${getStatusBadgeColor(appointment.status)}">${appointment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editAppointment('${appointment.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAppointment('${appointment.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Doctors Page
function loadDoctors() {
    const doctors = db.getUserDoctors();
    renderDoctorsCards(doctors);
}

// Render Doctors Cards
function renderDoctorsCards(doctors) {
    const container = document.getElementById('doctors-cards-container');
    
    if (doctors.length === 0) {
        container.innerHTML = createEmptyState('No doctors found', 'bi-person-vcard');
        return;
    }
    
    let html = `<div class="row">`;
    
    doctors.forEach(doctor => {
        html += `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card doctor-card h-100">
                    <div class="card-header">
                        <h5 class="card-title mb-0">${doctor.name}</h5>
                    </div>
                    <div class="card-body">
                        <p class="card-text"><strong>Specialty:</strong> ${doctor.specialty || '-'}</p>
                        ${doctor.phone ? `<p class="card-text"><i class="bi bi-telephone"></i> ${doctor.phone}</p>` : ''}
                        ${doctor.email ? `<p class="card-text"><i class="bi bi-envelope"></i> ${doctor.email}</p>` : ''}
                        ${doctor.address ? `<p class="card-text"><i class="bi bi-geo-alt"></i> ${doctor.address}</p>` : ''}
                        ${doctor.hours ? `<p class="card-text"><i class="bi bi-clock"></i> ${doctor.hours}</p>` : ''}
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="editDoctor('${doctor.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteDoctor('${doctor.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
}

// Load Medications Page
function loadMedications() {
    const medications = db.getUserMedications();
    renderMedicationsTable(medications);
}

// Render Medications Table
function renderMedicationsTable(medications) {
    const container = document.getElementById('medications-table-container');
    
    if (medications.length === 0) {
        container.innerHTML = createEmptyState('No medications found', 'bi-capsule');
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Dosage</th>
                        <th>Frequency</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    medications.forEach(medication => {
        const startDate = formatDate(medication.startDate);
        const endDate = formatDate(medication.endDate);
        
        html += `
            <tr>
                <td>${medication.name}</td>
                <td>${medication.dosage || '-'}</td>
                <td>${medication.frequency || '-'}</td>
                <td>${startDate || '-'}</td>
                <td>${endDate || '-'}</td>
                <td><span class="badge bg-${getStatusBadgeColor(medication.status)}">${medication.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editMedication('${medication.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteMedication('${medication.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Diagnoses Page
function loadDiagnoses() {
    // Populate doctor select options for the modal
    populateDoctorOptions('diagnosis-doctor');
    
    // Load diagnoses table
    const diagnoses = db.getUserDiagnoses();
    renderDiagnosesTable(diagnoses);
}

// Render Diagnoses Table
function renderDiagnosesTable(diagnoses) {
    const container = document.getElementById('diagnoses-table-container');
    
    if (diagnoses.length === 0) {
        container.innerHTML = createEmptyState('No diagnoses found', 'bi-clipboard2-pulse');
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Condition</th>
                        <th>Diagnosis Date</th>
                        <th>Doctor</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    diagnoses.forEach(diagnosis => {
        const diagnosisDate = formatDate(diagnosis.diagnosisDate);
        const doctorName = db.getDoctorName(diagnosis.doctorId);
        
        html += `
            <tr>
                <td>${diagnosis.condition}</td>
                <td>${diagnosisDate || '-'}</td>
                <td>${doctorName || '-'}</td>
                <td><span class="badge bg-${getSeverityBadgeColor(diagnosis.severity)}">${diagnosis.severity || 'Unknown'}</span></td>
                <td><span class="badge bg-${getStatusBadgeColor(diagnosis.status)}">${diagnosis.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editDiagnosis('${diagnosis.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDiagnosis('${diagnosis.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// Load Test Results Page
function loadTestResults() {
    // Populate doctor select options for the modal
    populateDoctorOptions('test-result-doctor');
    
    // Load test results table
    const testResults = db.getUserTestResults();
    renderTestResultsTable(testResults);
}

// Render Test Results Table
function renderTestResultsTable(testResults) {
    const container = document.getElementById('test-results-table-container');
    
    if (testResults.length === 0) {
        container.innerHTML = createEmptyState('No test results found', 'bi-file-earmark-medical');
        return;
    }
    
    let html = `
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    testResults.forEach(testResult => {
        const testDate = formatDate(testResult.testDate);
        const doctorName = db.getDoctorName(testResult.doctorId);
        
        html += `
            <tr>
                <td>${testResult.testName}</td>
                <td>${testResult.testType || '-'}</td>
                <td>${testDate || '-'}</td>
                <td>${doctorName || '-'}</td>
                <td><span class="badge bg-${getStatusBadgeColor(testResult.status)}">${testResult.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editTestResult('${testResult.id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTestResult('${testResult.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewTestResult('${testResult.id}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

// View Test Result
function viewTestResult(id) {
    const testResult = db.getTestResultById(id);
    
    if (!testResult) {
        showAlert('Test result not found.', 'danger');
        return;
    }
    
    const testDate = formatDate(testResult.testDate);
    const doctorName = db.getDoctorName(testResult.doctorId);
    
    // Populate modal
    document.getElementById('view-test-result-name').textContent = testResult.testName;
    document.getElementById('view-test-result-type').textContent = testResult.testType || '-';
    document.getElementById('view-test-result-date').textContent = testDate || '-';
    document.getElementById('view-test-result-doctor').textContent = doctorName || '-';
    document.getElementById('view-test-result-status').textContent = testResult.status;
    document.getElementById('view-test-result-status').className = `badge bg-${getStatusBadgeColor(testResult.status)}`;
    document.getElementById('view-test-result-results').textContent = testResult.results || 'No results available';
    
    // Show modal
    $('#viewTestResultModal').modal('show');
}

// Load Medical Feedback Page
function loadMedicalFeedback() {
    // Populate appointment select options for the modal
    populateAppointmentOptions('feedback-appointment');
    
    // Load medical feedback
    const feedback = db.getUserMedicalFeedback();
    renderMedicalFeedbackCards(feedback);
}

// Render Medical Feedback Cards
function renderMedicalFeedbackCards(feedback) {
    const container = document.getElementById('feedback-cards-container');
    
    if (feedback.length === 0) {
        container.innerHTML = createEmptyState('No medical feedback found', 'bi-chat-left-text');
        return;
    }
    
    let html = `<div class="row">`;
    
    feedback.forEach(item => {
        const appointmentTitle = item.appointmentId ? db.getAppointmentTitle(item.appointmentId) : null;
        const createdDate = formatDate(item.createdAt);
        
        html += `
            <div class="col-lg-6 mb-4">
                <div class="card feedback-card h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">${appointmentTitle || 'General Feedback'}</h5>
                        <small>${createdDate}</small>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${item.notes}</p>
                    </div>
                    <div class="card-footer">
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="editFeedback('${item.id}')">
                                <i class="bi bi-pencil"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteFeedback('${item.id}')">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    
    container.innerHTML = html;
}

// Load Profile Page
function loadProfile() {
    if (!db.currentUser) return;
    
    // Populate profile form
    document.getElementById('profile-username').value = db.currentUser.username || '';
    document.getElementById('profile-email').value = db.currentUser.email || '';
    document.getElementById('profile-first-name').value = db.currentUser.firstName || '';
    document.getElementById('profile-last-name').value = db.currentUser.lastName || '';
}

// Helper Functions

// Get status badge color
function getStatusBadgeColor(status) {
    switch (status) {
        case 'scheduled':
            return 'primary';
        case 'completed':
            return 'success';
        case 'cancelled':
            return 'danger';
        case 'rescheduled':
            return 'warning';
        case 'active':
            return 'success';
        case 'inactive':
            return 'secondary';
        case 'pending':
            return 'warning';
        case 'normal':
            return 'success';
        case 'abnormal':
            return 'danger';
        default:
            return 'secondary';
    }
}

// Get severity badge color
function getSeverityBadgeColor(severity) {
    switch (severity) {
        case 'mild':
            return 'info';
        case 'moderate':
            return 'warning';
        case 'severe':
            return 'danger';
        default:
            return 'secondary';
    }
}
