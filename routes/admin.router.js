import { Router } from 'express';
import { User } from '../models/user.model.js';
import { Hive } from '../models/hive.model.js';
import { Crop } from '../models/crop.model.js';
import { asyncHandler } from '../utils/asyncHandler.js'; 

const router = Router();
// it is admin or not
const ensureAdmin = (req, res, next) => {
    // Check session first
    console.log(req.session);
    console.log(req.session.user);
    console.log(req.session.user.role);
    
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next(); // User is logged in via session and is admin
    }
    // If not in session, redirect to login
    res.redirect('/admin/login');
};


// --- Admin Login Routes ---
// GET /admin/login - Show login page
router.get('/', (req, res) => {
    // If already logged in as admin, redirect to dashboard
    if (req.session && req.session.user && req.session.user.role === 'admin') {
       return res.redirect('/admin/dashboard');
    }
    res.render('login', { error: null }); // Pass null error initially
});

// POST /admin/login - Handle login attempt
router.post('/login', asyncHandler(async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
         return res.status(400).render('login', { error: 'Username/Email and password are required.' });
    }

    const user = await User.findOne({
        $or: [{ username: usernameOrEmail.toLowerCase() }, { email: usernameOrEmail.toLowerCase() }],
    }).select('+password');

    if (!user) {
       return res.status(401).render('login', { error: 'User not found.' });
    }

    if (user.role !== 'admin') {
        return res.status(403).render('login', { error: 'Access denied. Not an administrator.' });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res.status(401).render('login', { error: 'Invalid password.' });
    }

    // --- Login successful - Set up session ---
    req.session.user = { // Store minimal, non-sensitive info in session
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
    };

    console.log("User data set in session:", req.session.user);
    console.log("Session ID before redirect:", req.sessionID); // Log the existing session ID

    // --- Temporarily comment out regeneration and explicit save ---
    /*
     req.session.regenerate((err) => {
        if (err) {
             console.error("Session regeneration error:", err);
             return res.status(500).render('login', { error: 'Login failed due to server error.' });
        }
        console.log("Session regenerated. New Session ID:", req.sessionID);
        req.session.save((saveErr) => {
            if (saveErr) {
                console.error("Error saving session after regenerate:", saveErr);
                 return res.status(500).render('login', { error: 'Login failed during session save.' });
            }
            console.log("Session saved after regenerate. Redirecting...");
            res.redirect('/admin/dashboard');
        });
     });
    */

    // --- Instead, try saving the current session and redirecting ---
    // This relies on the session middleware to save implicitly, or we can force it.
    req.session.save((saveErr) => { // Still good practice to save explicitly before redirect
        if (saveErr) {
            console.error("Error saving session:", saveErr);
            return res.status(500).render('login', { error: 'Login failed during session save.' });
        }
        console.log("Session saved (no regenerate). Redirecting...");
        res.redirect('/admin/dashboard'); // Redirect using the *existing* session ID
    });
}));


// GET /admin/dashboard - Show the dashboard (protected)
router.get('/dashboard', ensureAdmin, asyncHandler(async (req, res) => {
    // Fetch data for the dashboard
    const hiveCount = await Hive.countDocuments();
    const cropCount = await Crop.countDocuments();
    const userCount = await User.countDocuments(); // Count all users
    console.log("logguuuu");
    
    res.render('dashboard', {
        user: req.session.user, // Pass user info to template if needed
        hiveCount,
        cropCount,
        userCount
    });
}));


// POST /admin/logout
router.post('/logout', (req, res, next) => {
    req.session.destroy((err) => {
        if (err) {
             console.error("Session destruction error:", err);
             return res.redirect('/admin/dashboard'); // Redirect back if fails?
        }
        // Redirect to login page after successful logout
        res.redirect('/admin/');
    });
});


export default router;