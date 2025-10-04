const express = require('express');
const fs = require('fs');
const path = path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'appointments.json');

// --- Middleware ---
// Enable Cross-Origin Resource Sharing (CORS) to allow your live website 
// to communicate with this backend.
app.use(cors());
// Parse incoming requests that have a JSON payload.
app.use(express.json());

// --- Database Initialization ---
// This function checks if the appointments.json file exists. If not, it creates it
// with an empty array to prevent errors on the first run.
const initializeDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        console.log('Database file not found. Creating appointments.json...');
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
};

// --- API Routes ---

/**
 * @route   GET /api/appointments
 * @desc    Get all saved appointments
 * @access  Public
 */
app.get('/api/appointments', (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading from database file:', err);
            return res.status(500).json({ message: 'Error reading appointments data.' });
        }
        res.json(JSON.parse(data));
    });
});

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Public
 */
app.post('/api/appointments', (req, res) => {
    fs.readFile(DB_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading from database file:', err);
            return res.status(500).json({ message: 'Error reading appointments data.' });
        }
        
        const appointments = JSON.parse(data);
        
        // Create a new appointment object with a unique ID and timestamp
        const newAppointment = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body // Spread the data from the form (name, phone, etc.)
        };
        
        appointments.push(newAppointment);
        
        // Write the updated list back to the file
        fs.writeFile(DB_FILE, JSON.stringify(appointments, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to database file:', writeErr);
                return res.status(500).json({ message: 'Error saving appointment.' });
            }
            
            console.log(`New appointment saved: ${newAppointment.id} for ${newAppointment.name}`);
            res.status(201).json({
                message: 'Appointment booked successfully!',
                appointment: newAppointment
            });
        });
    });
});

// --- Server Startup ---
app.listen(PORT, () => {
    initializeDb();
    console.log(`Server is running successfully on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
});