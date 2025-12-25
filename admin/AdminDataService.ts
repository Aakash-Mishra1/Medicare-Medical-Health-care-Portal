/* START ADMIN PORTAL INTEGRATION - Shared Data Service for Admin Portal */
// This service manages shared data that syncs between patient, doctor, and admin portals
// All appointments, medical records, and user data are stored and retrieved from here

export interface SharedSystemData {
  appointments: any[];
  medicalRecords: any[];
  users: any[];
  systemStats: {
    totalPatients: number;
    totalDoctors: number;
    totalAppointments: number;
    pendingApprovals: number;
  };
}

class AdminDataService {
  private storageKey = 'admin_system_data';

  // Initialize system data
  initializeSystemData() {
    this.seedDemoData(); // Ensure demo data exists
    
    // Always sync with latest portal data
    const localAppointments = JSON.parse(localStorage.getItem('local_appointments') || '[]');
    const localRecords = JSON.parse(localStorage.getItem('local_medical_records') || '[]');
    
    let currentData: SharedSystemData;
    const existing = localStorage.getItem(this.storageKey);
    
    if (existing) {
      currentData = JSON.parse(existing);
      // Update with latest external data to ensure real-time sync
      currentData.appointments = localAppointments;
      currentData.medicalRecords = localRecords;
      // Users are always fetched dynamically in getAllUsers, but we update the cache here too
      currentData.users = this.getAllUsers();
    } else {
      currentData = {
        appointments: localAppointments,
        medicalRecords: localRecords,
        users: this.getAllUsers(),
        systemStats: {
          totalPatients: 0,
          totalDoctors: 0,
          totalAppointments: 0,
          pendingApprovals: 0
        }
      };
    }
    
    this.updateSystemData(currentData);
  }

  // Seed demo data
  seedDemoData() {
    const demoDoctors = [
      { id: 'd1', username: 'Dr. Rajesh Koothrappali', email: 'rajesh@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Cardiologist' },
      { id: 'd2', username: 'Dr. Priya Sharma', email: 'priya@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Dermatologist' },
      { id: 'd3', username: 'Dr. Amit Patel', email: 'amit@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Neurologist' },
      { id: 'd4', username: 'Dr. Anjali Gupta', email: 'anjali@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Pediatrician' },
      { id: 'd5', username: 'Dr. Vikram Singh', email: 'vikram@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Orthopedic' },
      { id: 'd6', username: 'Dr. Neha Kapoor', email: 'neha@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Gynecologist' },
      { id: 'd7', username: 'Dr. Sanjay Verma', email: 'sanjay@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Oncologist' },
      { id: 'd8', username: 'Dr. Meera Reddy', email: 'meera@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'Psychiatrist' },
      { id: 'd9', username: 'Dr. Arjun Nair', email: 'arjun@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'General Surgeon' },
      { id: 'd10', username: 'Dr. Kavita Malhotra', email: 'kavita@example.com', password: 'password123', role: 'doctor', status: 'Active', specialization: 'ENT Specialist' }
    ];

    const demoPatients = [
      { id: 'p1', username: 'Aarav Kumar', email: 'aarav@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p2', username: 'Vivaan Shah', email: 'vivaan@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p3', username: 'Aditya Mittal', email: 'aditya@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p4', username: 'Vihaan Joshi', email: 'vihaan@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p5', username: 'Arjun Mehta', email: 'arjun.m@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p6', username: 'Saanvi Choudhury', email: 'saanvi@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p7', username: 'Ananya Iyer', email: 'ananya@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p8', username: 'Diya Menon', email: 'diya@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p9', username: 'Ishaan Chatterjee', email: 'ishaan@example.com', password: 'password123', role: 'patient', status: 'Active' },
      { id: 'p10', username: 'Riya Deshmukh', email: 'riya@example.com', password: 'password123', role: 'patient', status: 'Active' }
    ];

    if (!localStorage.getItem('registered_doctors') || JSON.parse(localStorage.getItem('registered_doctors') || '[]').length === 0) {
      localStorage.setItem('registered_doctors', JSON.stringify(demoDoctors));
    }
    if (!localStorage.getItem('registered_patients') || JSON.parse(localStorage.getItem('registered_patients') || '[]').length === 0) {
      localStorage.setItem('registered_patients', JSON.stringify(demoPatients));
    }
  }

  // Get all appointments across platform
  getAllAppointments() {
    return JSON.parse(localStorage.getItem('local_appointments') || '[]');
  }

  // Get all medical records
  getAllMedicalRecords() {
    return JSON.parse(localStorage.getItem('local_medical_records') || '[]');
  }

  // Get all users (patients + doctors)
  getAllUsers() {
    const patients = JSON.parse(localStorage.getItem('registered_patients') || '[]');
    const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');
    return [
      ...patients.map((p: any) => ({ ...p, role: 'patient' })),
      ...doctors.map((d: any) => ({ ...d, role: 'doctor' }))
    ];
  }

  // Get system statistics
  getSystemStats() {
    const appointments = this.getAllAppointments();
    const users = this.getAllUsers();

    return {
      totalPatients: users.filter(u => u.role === 'patient').length,
      totalDoctors: users.filter(u => u.role === 'doctor').length,
      totalAppointments: appointments.length,
      activeAppointments: appointments.filter((a: any) => a.status === 'Scheduled').length,
      completedAppointments: appointments.filter((a: any) => a.status === 'Completed').length,
      pendingApprovals: users.filter((u: any) => u.status === 'Pending').length,
      systemHealth: 98
    };
  }

  // Sync appointment data
  syncAppointment(appointment: any) {
    const appointments = this.getAllAppointments();
    const index = appointments.findIndex((a: any) => a._id === appointment._id);
    
    if (index >= 0) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }
    
    localStorage.setItem('local_appointments', JSON.stringify(appointments));
  }

  // Sync medical record
  syncMedicalRecord(record: any) {
    const records = this.getAllMedicalRecords();
    const index = records.findIndex((r: any) => r._id === record._id);
    
    if (index >= 0) {
      records[index] = record;
    } else {
      records.push(record);
    }
    
    localStorage.setItem('local_medical_records', JSON.stringify(records));
  }

  // Delete appointment
  deleteAppointment(appointmentId: string) {
    const appointments = this.getAllAppointments();
    const filtered = appointments.filter((a: any) => a._id !== appointmentId);
    localStorage.setItem('local_appointments', JSON.stringify(filtered));
  }

  // Delete medical record
  deleteMedicalRecord(recordId: string) {
    const records = this.getAllMedicalRecords();
    const filtered = records.filter((r: any) => r._id !== recordId);
    localStorage.setItem('local_medical_records', JSON.stringify(filtered));
  }

  // Get user by email
  getUserByEmail(email: string) {
    const users = this.getAllUsers();
    return users.find(u => u.email === email);
  }

  // Approve/Reject doctor
  approveDoctorProfile(doctorEmail: string, approve: boolean) {
    const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');
    const index = doctors.findIndex((d: any) => d.email === doctorEmail);
    
    if (index >= 0) {
      doctors[index].status = approve ? 'Active' : 'Rejected';
      localStorage.setItem('registered_doctors', JSON.stringify(doctors));
    }
  }

  // Get appointment by ID
  getAppointmentById(id: string) {
    const appointments = this.getAllAppointments();
    return appointments.find((a: any) => a._id === id);
  }

  // Get medical records by patient
  getPatientMedicalRecords(patientEmail: string) {
    const records = this.getAllMedicalRecords();
    return records.filter((r: any) => r.patientEmail === patientEmail);
  }

  // Get appointments by doctor
  getDoctorAppointments(doctorEmail: string) {
    const appointments = this.getAllAppointments();
    return appointments.filter((a: any) => a.doctorEmail === doctorEmail);
  }

  // Get appointments by patient
  getPatientAppointments(patientEmail: string) {
    const appointments = this.getAllAppointments();
    return appointments.filter((a: any) => a.patientEmail === patientEmail);
  }

  // Update user status
  updateUserStatus(email: string, status: string) {
    const users = this.getAllUsers();
    const patients = JSON.parse(localStorage.getItem('registered_patients') || '[]');
    const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');

    const patientIndex = patients.findIndex((p: any) => p.email === email);
    const doctorIndex = doctors.findIndex((d: any) => d.email === email);

    if (patientIndex >= 0) {
      patients[patientIndex].status = status;
      localStorage.setItem('registered_patients', JSON.stringify(patients));
    }
    if (doctorIndex >= 0) {
      doctors[doctorIndex].status = status;
      localStorage.setItem('registered_doctors', JSON.stringify(doctors));
    }
  }

  // Add new user
  addUser(user: any) {
    if (user.role === 'doctor') {
      const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');
      doctors.push({ ...user, id: 'd' + Date.now(), status: 'Active' });
      localStorage.setItem('registered_doctors', JSON.stringify(doctors));
    } else {
      const patients = JSON.parse(localStorage.getItem('registered_patients') || '[]');
      patients.push({ ...user, id: 'p' + Date.now(), status: 'Active' });
      localStorage.setItem('registered_patients', JSON.stringify(patients));
    }
  }

  // Delete user completely
  deleteUser(email: string, role: string) {
    if (role === 'doctor') {
      const doctors = JSON.parse(localStorage.getItem('registered_doctors') || '[]');
      const filtered = doctors.filter((d: any) => d.email !== email);
      localStorage.setItem('registered_doctors', JSON.stringify(filtered));
    } else {
      const patients = JSON.parse(localStorage.getItem('registered_patients') || '[]');
      const filtered = patients.filter((p: any) => p.email !== email);
      localStorage.setItem('registered_patients', JSON.stringify(filtered));
    }
  }

  // Private helper methods
  private getSystemData(): SharedSystemData {
    const data = localStorage.getItem(this.storageKey);
    if (!data) {
      this.initializeSystemData();
      return this.getSystemData();
    }
    return JSON.parse(data);
  }

  private updateSystemData(data: SharedSystemData) {
    this.updateSystemStats(data);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private updateSystemStats(data: SharedSystemData) {
    const users = this.getAllUsers();
    data.systemStats = {
      totalPatients: users.filter(u => u.role === 'patient').length,
      totalDoctors: users.filter(u => u.role === 'doctor').length,
      totalAppointments: data.appointments.length,
      pendingApprovals: users.filter(u => u.status === 'Pending').length + data.appointments.filter(a => a.status === 'Pending').length
    };
  }
}

export const adminDataService = new AdminDataService();
/* END ADMIN PORTAL INTEGRATION - Shared Data Service */
