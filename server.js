const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const APPOINTMENTS_FILE = path.join(__dirname, 'appointments.json');

app.use(cors());
app.use(express.json());

// --- Helper Functions ---
function readAppointments() {
    try {
        if (!fs.existsSync(APPOINTMENTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading appointments file:", error);
        return [];
    }
}

function writeAppointments(data) {
    try {
        fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to appointments file:", error);
    }
}

// --- API Routes ---

// GET all appointments
app.get('/api/appointments', (req, res) => {
    const appointments = readAppointments();
    res.json(appointments);
});

// POST a new appointment
app.post('/api/appointments', (req, res) => {
    const appointments = readAppointments();
    const newAppointment = {
        ...req.body,
        id: Date.now().toString(), // Use timestamp as a unique ID
        timestamp: new Date().toISOString()
    };
    appointments.push(newAppointment);
    writeAppointments(appointments);
    res.status(201).json(newAppointment);
});

// PUT (Update) an existing appointment by ID
app.put('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;
    let appointments = readAppointments();
    
    const appointmentIndex = appointments.findIndex(app => app.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    // Preserve original ID and timestamp, update the rest
    appointments[appointmentIndex] = { 
        ...appointments[appointmentIndex], 
        ...updatedData 
    };

    writeAppointments(appointments);
    res.json(appointments[appointmentIndex]);
});

// DELETE an appointment by ID
app.delete('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    let appointments = readAppointments();
    
    const initialLength = appointments.length;
    appointments = appointments.filter(app => app.id !== id);

    if (appointments.length === initialLength) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    writeAppointments(appointments);
    res.status(200).json({ message: 'Appointment deleted successfully' });
});


app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
