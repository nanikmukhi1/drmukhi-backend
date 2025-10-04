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
        // Ensure every appointment has a status
        const appointments = JSON.parse(data);
        return appointments.map(app => ({ status: 'Scheduled', ...app }));
    } catch (error) {
        console.error("Error reading appointments file:", error);
        return [];
    }
}

function writeAppointments(data) {
    try {
        fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
    } catch (error)
    {
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
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        status: 'Scheduled' // Default status for new appointments
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
    
    // Update appointment, ensuring status is preserved if not provided
    appointments[appointmentIndex] = { 
        ...appointments[appointmentIndex], 
        ...updatedData 
    };

    writeAppointments(appointments);
    res.json(appointments[appointmentIndex]);
});

// PATCH (Update status) of an existing appointment
app.patch('/api/appointments/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    let appointments = readAppointments();
    const appointmentIndex = appointments.findIndex(app => app.id === id);

    if (appointmentIndex === -1) {
        return res.status(404).json({ message: 'Appointment not found' });
    }

    appointments[appointmentIndex].status = status;
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
