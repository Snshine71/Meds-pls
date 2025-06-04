/**
 * Medical Appointment Tracker - Data Models
 * 
 * This file contains all data models and localStorage management for the application.
 * It handles data persistence, CRUD operations, and relationships between entities.
 */

// Main Database class to handle localStorage operations
class Database {
    constructor() {
        // Initialize database structure if it doesn't exist
        if (!localStorage.getItem('medicalTracker_initialized')) {
            this.initializeDatabase();
        }
        
        // Load current user if logged in
        this.currentUser = JSON.parse(localStorage.getItem('medicalTracker_currentUser'));
    }
    
    // Initialize empty database structure
    initializeDatabase() {
        localStorage.setItem('medicalTracker_users', JSON.stringify([]));
        localStorage.setItem('medicalTracker_appointments', JSON.stringify([]));
        localStorage.setItem('medicalTracker_doctors', JSON.stringify([]));
        localStorage.setItem('medicalTracker_medications', JSON.stringify([]));
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify([]));
        localStorage.setItem('medicalTracker_testResults', JSON.stringify([]));
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify([]));
        localStorage.setItem('medicalTracker_initialized', 'true');
    }
    
    // Clear all data (for testing or user data reset)
    clearDatabase() {
        this.initializeDatabase();
        localStorage.removeItem('medicalTracker_currentUser');
        this.currentUser = null;
    }
    
    // Export all data as JSON
    exportData() {
        if (!this.currentUser) return null;
        
        const userId = this.currentUser.id;
        
        return {
            user: this.currentUser,
            appointments: this.getAppointments().filter(a => a.userId === userId),
            doctors: this.getDoctors().filter(d => d.userId === userId),
            medications: this.getMedications().filter(m => m.userId === userId),
            diagnoses: this.getDiagnoses().filter(d => d.userId === userId),
            testResults: this.getTestResults().filter(t => t.userId === userId),
            medicalFeedback: this.getMedicalFeedback().filter(f => f.userId === userId)
        };
    }
    
    // Import data from JSON
    importData(data) {
        if (!this.currentUser) return false;
        
        const userId = this.currentUser.id;
        
        // Remove existing user data
        this.removeUserData(userId);
        
        // Import new data
        const appointments = this.getAppointments();
        const doctors = this.getDoctors();
        const medications = this.getMedications();
        const diagnoses = this.getDiagnoses();
        const testResults = this.getTestResults();
        const medicalFeedback = this.getMedicalFeedback();
        
        // Ensure imported data has the correct userId
        data.appointments.forEach(a => { a.userId = userId; appointments.push(a); });
        data.doctors.forEach(d => { d.userId = userId; doctors.push(d); });
        data.medications.forEach(m => { m.userId = userId; medications.push(m); });
        data.diagnoses.forEach(d => { d.userId = userId; diagnoses.push(d); });
        data.testResults.forEach(t => { t.userId = userId; testResults.push(t); });
        data.medicalFeedback.forEach(f => { f.userId = userId; medicalFeedback.push(f); });
        
        // Save updated data
        localStorage.setItem('medicalTracker_appointments', JSON.stringify(appointments));
        localStorage.setItem('medicalTracker_doctors', JSON.stringify(doctors));
        localStorage.setItem('medicalTracker_medications', JSON.stringify(medications));
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify(diagnoses));
        localStorage.setItem('medicalTracker_testResults', JSON.stringify(testResults));
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify(medicalFeedback));
        
        return true;
    }
    
    // Remove all data for a specific user
    removeUserData(userId) {
        let appointments = this.getAppointments().filter(a => a.userId !== userId);
        let doctors = this.getDoctors().filter(d => d.userId !== userId);
        let medications = this.getMedications().filter(m => m.userId !== userId);
        let diagnoses = this.getDiagnoses().filter(d => d.userId !== userId);
        let testResults = this.getTestResults().filter(t => t.userId !== userId);
        let medicalFeedback = this.getMedicalFeedback().filter(f => f.userId !== userId);
        
        localStorage.setItem('medicalTracker_appointments', JSON.stringify(appointments));
        localStorage.setItem('medicalTracker_doctors', JSON.stringify(doctors));
        localStorage.setItem('medicalTracker_medications', JSON.stringify(medications));
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify(diagnoses));
        localStorage.setItem('medicalTracker_testResults', JSON.stringify(testResults));
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify(medicalFeedback));
    }
    
    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // User Authentication Methods
    
    // Register a new user
    registerUser(username, email, firstName, lastName, password) {
        const users = JSON.parse(localStorage.getItem('medicalTracker_users'));
        
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'Username already exists' };
        }
        
        // Create new user
        const newUser = {
            id: this.generateId(),
            username,
            email,
            firstName,
            lastName,
            password, // In a real app, this should be hashed
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('medicalTracker_users', JSON.stringify(users));
        
        // Set as current user (auto-login)
        const userForSession = { ...newUser };
        delete userForSession.password; // Don't store password in session
        
        localStorage.setItem('medicalTracker_currentUser', JSON.stringify(userForSession));
        this.currentUser = userForSession;
        
        return { success: true, user: userForSession };
    }
    
    // Login user
    loginUser(username, password) {
        const users = JSON.parse(localStorage.getItem('medicalTracker_users'));
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }
        
        // Set as current user
        const userForSession = { ...user };
        delete userForSession.password; // Don't store password in session
        
        localStorage.setItem('medicalTracker_currentUser', JSON.stringify(userForSession));
        this.currentUser = userForSession;
        
        return { success: true, user: userForSession };
    }
    
    // Logout user
    logoutUser() {
        localStorage.removeItem('medicalTracker_currentUser');
        this.currentUser = null;
        return { success: true };
    }
    
    // Update user profile
    updateUserProfile(email, firstName, lastName) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const users = JSON.parse(localStorage.getItem('medicalTracker_users'));
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }
        
        // Update user
        users[userIndex].email = email;
        users[userIndex].firstName = firstName;
        users[userIndex].lastName = lastName;
        
        localStorage.setItem('medicalTracker_users', JSON.stringify(users));
        
        // Update current user
        this.currentUser.email = email;
        this.currentUser.firstName = firstName;
        this.currentUser.lastName = lastName;
        
        localStorage.setItem('medicalTracker_currentUser', JSON.stringify(this.currentUser));
        
        return { success: true, user: this.currentUser };
    }
    
    // Change user password
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const users = JSON.parse(localStorage.getItem('medicalTracker_users'));
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }
        
        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }
        
        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem('medicalTracker_users', JSON.stringify(users));
        
        return { success: true };
    }
    
    // Appointment Methods
    
    // Get all appointments for current user
    getAppointments() {
        return JSON.parse(localStorage.getItem('medicalTracker_appointments') || '[]');
    }
    
    // Get user's appointments
    getUserAppointments() {
        if (!this.currentUser) return [];
        return this.getAppointments().filter(a => a.userId === this.currentUser.id);
    }
    
    // Get upcoming appointments
    getUpcomingAppointments() {
        if (!this.currentUser) return [];
        const now = new Date();
        return this.getUserAppointments()
            .filter(a => new Date(a.date) >= now && a.status === 'scheduled')
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    // Get appointment by ID
    getAppointmentById(id) {
        return this.getAppointments().find(a => a.id === id);
    }
    
    // Add new appointment
    addAppointment(appointmentData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const appointments = this.getAppointments();
        
        const newAppointment = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...appointmentData
        };
        
        appointments.push(newAppointment);
        localStorage.setItem('medicalTracker_appointments', JSON.stringify(appointments));
        
        return { success: true, appointment: newAppointment };
    }
    
    // Update appointment
    updateAppointment(id, appointmentData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const appointments = this.getAppointments();
        const index = appointments.findIndex(a => a.id === id && a.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Appointment not found' };
        }
        
        // Update appointment
        appointments[index] = { ...appointments[index], ...appointmentData };
        localStorage.setItem('medicalTracker_appointments', JSON.stringify(appointments));
        
        return { success: true, appointment: appointments[index] };
    }
    
    // Delete appointment
    deleteAppointment(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const appointments = this.getAppointments();
        const filteredAppointments = appointments.filter(a => !(a.id === id && a.userId === this.currentUser.id));
        
        if (filteredAppointments.length === appointments.length) {
            return { success: false, message: 'Appointment not found' };
        }
        
        localStorage.setItem('medicalTracker_appointments', JSON.stringify(filteredAppointments));
        
        return { success: true };
    }
    
    // Doctor Methods
    
    // Get all doctors
    getDoctors() {
        return JSON.parse(localStorage.getItem('medicalTracker_doctors') || '[]');
    }
    
    // Get user's doctors
    getUserDoctors() {
        if (!this.currentUser) return [];
        return this.getDoctors().filter(d => d.userId === this.currentUser.id);
    }
    
    // Get doctor by ID
    getDoctorById(id) {
        return this.getDoctors().find(d => d.id === id);
    }
    
    // Add new doctor
    addDoctor(doctorData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const doctors = this.getDoctors();
        
        const newDoctor = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...doctorData
        };
        
        doctors.push(newDoctor);
        localStorage.setItem('medicalTracker_doctors', JSON.stringify(doctors));
        
        return { success: true, doctor: newDoctor };
    }
    
    // Update doctor
    updateDoctor(id, doctorData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const doctors = this.getDoctors();
        const index = doctors.findIndex(d => d.id === id && d.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Doctor not found' };
        }
        
        // Update doctor
        doctors[index] = { ...doctors[index], ...doctorData };
        localStorage.setItem('medicalTracker_doctors', JSON.stringify(doctors));
        
        return { success: true, doctor: doctors[index] };
    }
    
    // Delete doctor
    deleteDoctor(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const doctors = this.getDoctors();
        const filteredDoctors = doctors.filter(d => !(d.id === id && d.userId === this.currentUser.id));
        
        if (filteredDoctors.length === doctors.length) {
            return { success: false, message: 'Doctor not found' };
        }
        
        localStorage.setItem('medicalTracker_doctors', JSON.stringify(filteredDoctors));
        
        return { success: true };
    }
    
    // Medication Methods
    
    // Get all medications
    getMedications() {
        return JSON.parse(localStorage.getItem('medicalTracker_medications') || '[]');
    }
    
    // Get user's medications
    getUserMedications() {
        if (!this.currentUser) return [];
        return this.getMedications().filter(m => m.userId === this.currentUser.id);
    }
    
    // Get active medications
    getActiveMedications() {
        if (!this.currentUser) return [];
        return this.getUserMedications().filter(m => m.status === 'active');
    }
    
    // Get medication by ID
    getMedicationById(id) {
        return this.getMedications().find(m => m.id === id);
    }
    
    // Add new medication
    addMedication(medicationData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medications = this.getMedications();
        
        const newMedication = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...medicationData
        };
        
        medications.push(newMedication);
        localStorage.setItem('medicalTracker_medications', JSON.stringify(medications));
        
        return { success: true, medication: newMedication };
    }
    
    // Update medication
    updateMedication(id, medicationData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medications = this.getMedications();
        const index = medications.findIndex(m => m.id === id && m.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Medication not found' };
        }
        
        // Update medication
        medications[index] = { ...medications[index], ...medicationData };
        localStorage.setItem('medicalTracker_medications', JSON.stringify(medications));
        
        return { success: true, medication: medications[index] };
    }
    
    // Delete medication
    deleteMedication(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medications = this.getMedications();
        const filteredMedications = medications.filter(m => !(m.id === id && m.userId === this.currentUser.id));
        
        if (filteredMedications.length === medications.length) {
            return { success: false, message: 'Medication not found' };
        }
        
        localStorage.setItem('medicalTracker_medications', JSON.stringify(filteredMedications));
        
        return { success: true };
    }
    
    // Diagnosis Methods
    
    // Get all diagnoses
    getDiagnoses() {
        return JSON.parse(localStorage.getItem('medicalTracker_diagnoses') || '[]');
    }
    
    // Get user's diagnoses
    getUserDiagnoses() {
        if (!this.currentUser) return [];
        return this.getDiagnoses().filter(d => d.userId === this.currentUser.id);
    }
    
    // Get active diagnoses
    getActiveDiagnoses() {
        if (!this.currentUser) return [];
        return this.getUserDiagnoses().filter(d => d.status === 'active');
    }
    
    // Get diagnosis by ID
    getDiagnosisById(id) {
        return this.getDiagnoses().find(d => d.id === id);
    }
    
    // Add new diagnosis
    addDiagnosis(diagnosisData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const diagnoses = this.getDiagnoses();
        
        const newDiagnosis = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...diagnosisData
        };
        
        diagnoses.push(newDiagnosis);
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify(diagnoses));
        
        return { success: true, diagnosis: newDiagnosis };
    }
    
    // Update diagnosis
    updateDiagnosis(id, diagnosisData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const diagnoses = this.getDiagnoses();
        const index = diagnoses.findIndex(d => d.id === id && d.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Diagnosis not found' };
        }
        
        // Update diagnosis
        diagnoses[index] = { ...diagnoses[index], ...diagnosisData };
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify(diagnoses));
        
        return { success: true, diagnosis: diagnoses[index] };
    }
    
    // Delete diagnosis
    deleteDiagnosis(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const diagnoses = this.getDiagnoses();
        const filteredDiagnoses = diagnoses.filter(d => !(d.id === id && d.userId === this.currentUser.id));
        
        if (filteredDiagnoses.length === diagnoses.length) {
            return { success: false, message: 'Diagnosis not found' };
        }
        
        localStorage.setItem('medicalTracker_diagnoses', JSON.stringify(filteredDiagnoses));
        
        return { success: true };
    }
    
    // Test Result Methods
    
    // Get all test results
    getTestResults() {
        return JSON.parse(localStorage.getItem('medicalTracker_testResults') || '[]');
    }
    
    // Get user's test results
    getUserTestResults() {
        if (!this.currentUser) return [];
        return this.getTestResults().filter(t => t.userId === this.currentUser.id);
    }
    
    // Get recent test results
    getRecentTestResults(limit = 5) {
        if (!this.currentUser) return [];
        return this.getUserTestResults()
            .sort((a, b) => new Date(b.testDate || b.createdAt) - new Date(a.testDate || a.createdAt))
            .slice(0, limit);
    }
    
    // Get test result by ID
    getTestResultById(id) {
        return this.getTestResults().find(t => t.id === id);
    }
    
    // Add new test result
    addTestResult(testResultData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const testResults = this.getTestResults();
        
        const newTestResult = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...testResultData
        };
        
        testResults.push(newTestResult);
        localStorage.setItem('medicalTracker_testResults', JSON.stringify(testResults));
        
        return { success: true, testResult: newTestResult };
    }
    
    // Update test result
    updateTestResult(id, testResultData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const testResults = this.getTestResults();
        const index = testResults.findIndex(t => t.id === id && t.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Test result not found' };
        }
        
        // Update test result
        testResults[index] = { ...testResults[index], ...testResultData };
        localStorage.setItem('medicalTracker_testResults', JSON.stringify(testResults));
        
        return { success: true, testResult: testResults[index] };
    }
    
    // Delete test result
    deleteTestResult(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const testResults = this.getTestResults();
        const filteredTestResults = testResults.filter(t => !(t.id === id && t.userId === this.currentUser.id));
        
        if (filteredTestResults.length === testResults.length) {
            return { success: false, message: 'Test result not found' };
        }
        
        localStorage.setItem('medicalTracker_testResults', JSON.stringify(filteredTestResults));
        
        return { success: true };
    }
    
    // Medical Feedback Methods
    
    // Get all medical feedback
    getMedicalFeedback() {
        return JSON.parse(localStorage.getItem('medicalTracker_medicalFeedback') || '[]');
    }
    
    // Get user's medical feedback
    getUserMedicalFeedback() {
        if (!this.currentUser) return [];
        return this.getMedicalFeedback().filter(f => f.userId === this.currentUser.id);
    }
    
    // Get recent medical feedback
    getRecentMedicalFeedback(limit = 5) {
        if (!this.currentUser) return [];
        return this.getUserMedicalFeedback()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
    
    // Get medical feedback by ID
    getMedicalFeedbackById(id) {
        return this.getMedicalFeedback().find(f => f.id === id);
    }
    
    // Add new medical feedback
    addMedicalFeedback(feedbackData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medicalFeedback = this.getMedicalFeedback();
        
        const newFeedback = {
            id: this.generateId(),
            userId: this.currentUser.id,
            createdAt: new Date().toISOString(),
            ...feedbackData
        };
        
        medicalFeedback.push(newFeedback);
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify(medicalFeedback));
        
        return { success: true, feedback: newFeedback };
    }
    
    // Update medical feedback
    updateMedicalFeedback(id, feedbackData) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medicalFeedback = this.getMedicalFeedback();
        const index = medicalFeedback.findIndex(f => f.id === id && f.userId === this.currentUser.id);
        
        if (index === -1) {
            return { success: false, message: 'Medical feedback not found' };
        }
        
        // Update medical feedback
        medicalFeedback[index] = { ...medicalFeedback[index], ...feedbackData };
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify(medicalFeedback));
        
        return { success: true, feedback: medicalFeedback[index] };
    }
    
    // Delete medical feedback
    deleteMedicalFeedback(id) {
        if (!this.currentUser) {
            return { success: false, message: 'Not logged in' };
        }
        
        const medicalFeedback = this.getMedicalFeedback();
        const filteredFeedback = medicalFeedback.filter(f => !(f.id === id && f.userId === this.currentUser.id));
        
        if (filteredFeedback.length === medicalFeedback.length) {
            return { success: false, message: 'Medical feedback not found' };
        }
        
        localStorage.setItem('medicalTracker_medicalFeedback', JSON.stringify(filteredFeedback));
        
        return { success: true };
    }
    
    // Helper Methods
    
    // Get doctor name by ID
    getDoctorName(doctorId) {
        if (!doctorId) return '';
        const doctor = this.getDoctorById(doctorId);
        return doctor ? doctor.name : '';
    }
    
    // Get appointment title by ID
    getAppointmentTitle(appointmentId) {
        if (!appointmentId) return '';
        const appointment = this.getAppointmentById(appointmentId);
        return appointment ? appointment.title : '';
    }
    
    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    // Format time for display
    formatTime(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Create global database instance
const db = new Database();
