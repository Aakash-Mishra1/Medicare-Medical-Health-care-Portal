# MyHealthProject - Healthcare Management Portal (CSE222 Project)

## Project Overview
This is our project for CSE222, a Healthcare Management System designed to connect patients, doctors, and administrators. We built this web application to serve as a central place for managing appointments, medical records, and communication. We had also added some AI features to help with health questions.

The project is built using the MERN Stack (MongoDB, Express.js, React.js, Node.js). We had focused on making it secure and easy to use on both computers and phones.

## Key Functionalities

### 1. User Roles & Authentication
*   Secure Login/Register: We had used JWT (JSON Web Token) to handle secure login and registration.
*   Role-Based Access Control: There are separate areas for Patients, Doctors, and Admins, so everyone sees only what they need to see.

### 2. Patient Portal
*   Dashboard: Shows a summary of health stats and what is coming up next.
*   Book Appointments: A simple way for patients to book times with doctors.
*   Medical Records: Patients can see their history, prescriptions, and reports here.
*   Symptom Checker: We had added an AI tool that helps users check their symptoms.

### 3. Doctor Portal
*   Doctor Dashboard: Doctors can see their schedule and upcoming appointments.
*   Patient Management: Allows doctors to view patient profiles and records securely.
*   Consultation Tools: Features for writing prescriptions and notes.

### 4. Admin Portal
*   System Management: A dashboard for the admin to oversee everything.
*   User Management: The admin can manage doctor and patient accounts.
*   Analytics: Shows statistics about how the system is being used.

### 5. Advanced Features
*   AI Health Assistant (Gemini Bot): We integrated Google Gemini AI to answer health questions instantly.
*   Real-time Chat: We used Socket.io so patients and doctors can chat in real-time.
*   Health Analytics: We used Recharts to show health trends with graphs.
*   Responsive Design: The site works well on mobile and desktop because We used Tailwind CSS.

## Technologies Used

We had used the MERN Stack for this project:

### Frontend (Client-Side)
*   React.js (Vite): Used for building the user interface.
*   TypeScript: Used to make the code safer and easier to maintain.
*   Tailwind CSS: Used for styling the website quickly.
*   Lucide React: Used for the icons.
*   Recharts: Used for the charts and graphs.
*   React Router DOM: Used for navigation between pages.

### Backend (Server-Side)
*   Node.js: The runtime environment for the server.
*   Express.js: The framework used to build the API.
*   Socket.io: Used for the real-time chat feature.
*   JWT (JSON Web Tokens): Used for secure authentication.

### Database
*   MongoDB Atlas: The cloud database used to store all the data like users and appointments.

### AI Integration
*   Google Gemini API: Used to power the chatbot and symptom checker.
*   We built our own RESTful API using Node.js and Express.js.
*   We specifically used the @google/genai library to connect to Google's Gemini 3 Flash model. 
*  This powers the AI Health Assistant (chatbot) and the Symptom Checker.

## Getting Started

### Prerequisites
*   Node.js installed.
*   MongoDB Atlas connection string.
*   Google Gemini API Key.

### Installation

1.  Clone the repository:
    git clone <repository-url>
    cd myhealthproject-portal

2.  Install Dependencies:
    npm install

3.  Environment Setup:
    Create a .env file in the root directory and add your credentials:
    VITE_API_URL=http://localhost:5000/api

4.  Run the Application:
    npm run dev
    The application will start at http://localhost:5173.
