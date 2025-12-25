
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  PENDING = 'Pending'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  specialty: string;
  rating: number;
  description?: string;
  experience?: number;
  isVerified?: boolean;
  reviews?: Review[];
  totalPatients?: number;
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientEmail: string;
  patientName: string;
  doctorId: string;
  doctorEmail: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Vitals {
  _id: string;
  patientEmail: string;
  bloodPressure: string;
  heartRate: number;
  weight: number;
  temperature: number;
  timestamp: string;
}

export interface Prescription {
  _id: string;
  patientEmail: string;
  doctorName: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  duration: string;
  status: 'Active' | 'Completed';
}

// Added doctorEmail field to MedicalRecord interface to ensure clinical accountability and fix type errors in DoctorDashboard
export interface MedicalRecord {
  _id: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail: string;
  recordType: string;
  diagnosis: string;
  treatment: string;
  medications: Array<{ name: string; dosage: string; frequency: string; duration: string }>;
  recordDate: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  senderEmail: string;
  senderName: string;
  receiverEmail: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'read' | 'replied';
  createdAt: string;
}