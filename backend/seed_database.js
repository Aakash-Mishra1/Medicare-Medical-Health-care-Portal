const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connection String
const MONGO_URI = 'mongodb+srv://healthuser:25255225@cluster0.rxwc4ka.mongodb.net/myhealthproject?retryWrites=true&w=majority&appName=Cluster0';

// Schemas
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'admin' },
  department: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'doctor' },
  specialization: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const patientSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'patient' },
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  date: Date,
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  reason: String,
  notes: String
});

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  diagnosis: String,
  prescription: String,
  date: { type: Date, default: Date.now },
  attachments: [String]
});

const aiLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // Assuming mostly patients use AI
  query: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
  model: String
});

const systemLogSchema = new mongoose.Schema({
  action: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
  status: String
});

// Models
const Admin = mongoose.model('Admin', adminSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
const AILog = mongoose.model('AILog', aiLogSchema);
const SystemLog = mongoose.model('SystemLog', systemLogSchema);

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    console.log('Cleaning up old collections...');
    try {
        await mongoose.connection.db.dropCollection('users');
        console.log('Dropped old "users" collection.');
    } catch (e) {
        console.log('"users" collection might not exist or already dropped.');
    }
    
    await Admin.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await AILog.deleteMany({});
    await SystemLog.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Seeding 10 Admins...');
    const adminNames = [
        "Suresh Raina", "Ramesh Powar", "Ishita Patel", "Vikram Malhotra", 
        "Pooja Hegde", "Rahul Dravid", "Sneha Reddy", "Karan Johar", 
        "Manish Malhotra", "Sania Mirza"
    ];
    
    const admins = [];
    for (let i = 0; i < 10; i++) {
        admins.push({
            name: adminNames[i],
            email: dmin@medicare.com,
            password: hashedPassword,
            role: 'admin',
            department: ['IT', 'HR', 'Finance', 'Operations'][Math.floor(Math.random() * 4)],
            phone: '+91' + Math.floor(1000000000 + Math.random() * 9000000000)
        });
    }
    await Admin.create(admins);

    console.log('Seeding Doctors...');
    const doctorsData = [
      { name: 'Dr. Rajesh Koothrappali', email: 'rajesh@example.com', specialization: 'Cardiologist' },
      { name: 'Dr. Priya Sharma', email: 'priya@example.com', specialization: 'Dermatologist' },
      { name: 'Dr. Amit Patel', email: 'amit@example.com', specialization: 'Neurologist' },
      { name: 'Dr. Anjali Gupta', email: 'anjali@example.com', specialization: 'Pediatrician' },
      { name: 'Dr. Vikram Singh', email: 'vikram@example.com', specialization: 'Orthopedic' },
      { name: 'Dr. Neha Kapoor', email: 'neha@example.com', specialization: 'Gynecologist' },
      { name: 'Dr. Sanjay Verma', email: 'sanjay@example.com', specialization: 'Oncologist' },
      { name: 'Dr. Meera Reddy', email: 'meera@example.com', specialization: 'Psychiatrist' },
      { name: 'Dr. Arjun Nair', email: 'arjun@example.com', specialization: 'General Surgeon' },
      { name: 'Dr. Kavita Malhotra', email: 'kavita@example.com', specialization: 'ENT Specialist' }
    ];

    const createdDoctors = [];
    for (const doc of doctorsData) {
      const newDoc = await Doctor.create({
        name: doc.name,
        email: doc.email,
        password: hashedPassword,
        role: 'doctor',
        specialization: doc.specialization,
        phone: '+91' + Math.floor(1000000000 + Math.random() * 9000000000)
      });
      createdDoctors.push(newDoc);
    }

    console.log('Seeding Patients...');
    const patientsData = [
      { name: 'Aarav Kumar', email: 'aarav@example.com' },
      { name: 'Vivaan Shah', email: 'vivaan@example.com' },
      { name: 'Aditya Mittal', email: 'aditya@example.com' },
      { name: 'Vihaan Joshi', email: 'vihaan@example.com' },
      { name: 'Arjun Mehta', email: 'arjun.m@example.com' },
      { name: 'Saanvi Choudhury', email: 'saanvi@example.com' },
      { name: 'Ananya Iyer', email: 'ananya@example.com' },
      { name: 'Diya Menon', email: 'diya@example.com' },
      { name: 'Ishaan Chatterjee', email: 'ishaan@example.com' },
      { name: 'Riya Deshmukh', email: 'riya@example.com' }
    ];

    const createdPatients = [];
    for (const pat of patientsData) {
      const newPat = await Patient.create({
        name: pat.name,
        email: pat.email,
        password: hashedPassword,
        role: 'patient',
        phone: '+91' + Math.floor(1000000000 + Math.random() * 9000000000)
      });
      createdPatients.push(newPat);
    }

    console.log('Seeding Appointments...');
    const appointmentReasons = [
      'Regular Checkup', 'Fever and Cold', 'Skin Rash', 'Severe Headache', 
      'Joint Pain', 'Stomach Ache', 'Routine Vaccination', 'Blood Pressure Check'
    ];
    
    const appointments = [];
    for (let i = 0; i < 15; i++) {
      const randomDoctor = createdDoctors[Math.floor(Math.random() * createdDoctors.length)];
      const randomPatient = createdPatients[Math.floor(Math.random() * createdPatients.length)];
      const randomReason = appointmentReasons[Math.floor(Math.random() * appointmentReasons.length)];
      const status = ['pending', 'confirmed', 'completed', 'cancelled'][Math.floor(Math.random() * 4)];
      
      const date = new Date();
      date.setDate(date.getDate() + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 30));

      appointments.push({
        doctor: randomDoctor._id,
        patient: randomPatient._id,
        date: date,
        status: status,
        reason: randomReason,
        notes: status === 'completed' ? 'Patient advised to take rest and medication.' : ''
      });
    }
    await Appointment.create(appointments);

    console.log('Seeding Medical Records...');
    const medicalRecords = [
      {
        patient: createdPatients[0]._id,
        doctor: createdDoctors[0]._id,
        diagnosis: 'Mild Hypertension',
        prescription: 'Amlodipine 5mg daily',
        date: new Date('2024-12-10')
      },
      {
        patient: createdPatients[1]._id,
        doctor: createdDoctors[1]._id,
        diagnosis: 'Eczema',
        prescription: 'Hydrocortisone Cream',
        date: new Date('2024-11-20')
      },
      {
        patient: createdPatients[2]._id,
        doctor: createdDoctors[2]._id,
        diagnosis: 'Migraine',
        prescription: 'Naproxen 500mg',
        date: new Date('2024-12-05')
      },
      {
        patient: createdPatients[3]._id,
        doctor: createdDoctors[3]._id,
        diagnosis: 'Viral Fever',
        prescription: 'Paracetamol 500mg',
        date: new Date('2025-01-02')
      }
    ];
    await MedicalRecord.create(medicalRecords);

    console.log('Seeding AI Logs...');
    const aiLogs = [
      {
        user: createdPatients[0]._id,
        query: 'How to lower blood pressure naturally?',
        response: 'To lower blood pressure naturally, you can try: 1. Reducing sodium intake. 2. Exercising regularly. 3. Eating a healthy diet rich in whole grains and fruits.',
        model: 'Gemini Pro'
      },
      {
        user: createdPatients[1]._id,
        query: 'Best cream for dry skin rash',
        response: 'For dry skin rashes, moisturizers containing ceramides or hyaluronic acid are beneficial. If the rash is itchy, a mild hydrocortisone cream might help.',
        model: 'Gemini Pro'
      },
      {
        user: createdPatients[2]._id,
        query: 'Symptoms of migraine vs headache',
        response: 'Migraines are often accompanied by nausea, sensitivity to light/sound, and throbbing pain on one side. Tension headaches usually cause a steady ache around the head.',
        model: 'Gemini Pro'
      }
    ];
    await AILog.create(aiLogs);

    console.log('Seeding System Logs...');
    const systemLogs = [
      {
        action: 'System Startup',
        details: 'Server started successfully on port 5000.',
        status: 'Success'
      },
      {
        action: 'Database Backup',
        details: 'Daily backup completed.',
        status: 'Success'
      },
      {
        action: 'User Login Failed',
        details: 'Multiple failed login attempts for user admin@medicare.com',
        status: 'Warning'
      },
      {
        action: 'New Doctor Registration',
        details: 'Dr. Kavita Malhotra registered successfully.',
        status: 'Info'
      }
    ];
    await SystemLog.create(systemLogs);

    console.log('Database restructured and seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
