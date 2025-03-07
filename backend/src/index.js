const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Log request body if present
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    
    // Capture the original res.json to intercept responses
    const originalJson = res.json;
    res.json = function(data) {
        console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.url}:`, JSON.stringify(data, null, 2));
        return originalJson.call(this, data);
    };
    
    next();
});

// Health check route
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.use('/api/users', userRoutes);

// Create new user endpoint
app.post('/api/users/create', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("collection1");
        
        const userData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const result = await collection.insertOne(userData);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Error creating user in MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create user profile endpoint
app.post('/api/profiles/create', async (req, res) => {
    try {
        console.log('Received profile creation request with data:', req.body);
        
        const { getDB } = require('./config/db');
        const db = await getDB();
        const profilesCollection = db.collection("Profiles");
        const businessCollection = db.collection("Business-details");

        console.log("req.body", req.body);
        
        // Extract business-specific fields
        const { uid, job_title, company_size, company_url, company_bio, ...otherProfileData } = req.body;
        
        // Only proceed with profile creation if there's profile data
        if (Object.keys(otherProfileData).length > 0) {
            const profileData = {
                ...otherProfileData,
                uid, // Keep uid in profile data for reference
                createdAt: new Date(),
                updatedAt: new Date(),
                profileId: new Date().getTime().toString()
            };
            
            // Store profile data
            const profileResult = await profilesCollection.insertOne(profileData);
            console.log('Profile creation result:', profileResult);
        }

        // Check if business details already exist for this uid
        const existingBusiness = await businessCollection.findOne({ uid });

        let businessResult;
        
        // Create business details object
        const businessData = {
            uid,
            job_title,
            company_size,
            company_url,
            company_bio,
            updatedAt: new Date()
        };

        if (existingBusiness) {
            // Update existing business details
            businessResult = await businessCollection.updateOne(
                { uid },
                { 
                    $set: {
                        ...businessData
                    }
                }
            );
        } else {
            // Create new business details
            businessData.createdAt = new Date();
            businessResult = await businessCollection.insertOne(businessData);
        }
        
        console.log('Business details result:', businessResult);
        
        res.json({ 
            success: true, 
            businessDetails: businessResult 
        });
    } catch (error) {
        console.error("Error creating profile in MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Check if user has a profile
app.get('/api/profiles/check/:uid', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("Profiles");
        
        const profile = await collection.findOne({ uid: req.params.uid });
        res.json({ exists: !!profile });
    } catch (error) {
        console.error("Error checking profile in MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user profile
app.get('/api/profiles/:uid', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("Profiles");
        
        const profiles = await collection.find({ uid: req.params.uid }).toArray();
        res.json({ success: true, profiles });
    } catch (error) {
        console.error("Error fetching profiles from MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get personas by email and uid
app.get('/api/personas/:uid/:email', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("Profiles");
        
        console.log('Fetching personas for:', {
            uid: req.params.uid,
            email: req.params.email
        });

        const profiles = await collection.find({ 
            uid: req.params.uid,
            email: req.params.email
        }).toArray();

        console.log('Found profiles from DB:', profiles.length);
        if (profiles.length > 0) {
            console.log('Sample profile:', {
                _id: profiles[0]._id,
                persona_name: profiles[0].persona_name,
                profileId: profiles[0].profileId
            });
        }

        // Transform profiles into personas with consistent field names
        const personas = profiles.map(profile => {
            // Ensure persona_name exists
            if (!profile.persona_name) {
                console.warn('Profile missing persona_name:', profile);
                // Skip profiles without a name
                return null;
            }
            
            // Primary identifier for frontend use is MongoDB _id
            const mongoId = profile._id.toString();
            
            return {
                persona_type: profile.persona_type || 'Unknown',
                persona_name: profile.persona_name,
                persona_bio: profile.persona_bio || '',
                // Use MongoDB _id for reliable identification/deletion
                profileId: mongoId,
                // Include the database profileId as a separate field
                databaseProfileId: profile.profileId,
                // For UI categorization
                role: "system",
                id: profile.persona_type?.toLowerCase() === "general" ? 1 :
                    profile.persona_type?.toLowerCase() === "fashion" ? 2 :
                    profile.persona_type?.toLowerCase() === "luxury" ? 3 :
                    profile.persona_type?.toLowerCase() === "food" ? 4 :
                    profile.persona_type?.toLowerCase() === "technology" ? 5 : 1
            };
        }).filter(persona => persona !== null); // Remove any null entries

        console.log('Transformed personas to return:', personas.length);
        if (personas.length > 0) {
            console.log('Sample transformed persona:', {
                persona_name: personas[0].persona_name,
                profileId: personas[0].profileId
            });
        }
        
        res.json({ success: true, personas });
    } catch (error) {
        console.error("Error fetching personas from MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete persona by ObjectId or name
app.delete('/api/personas/:identifier', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("Profiles");
        const { ObjectId } = require('mongodb');
        
        const identifier = req.params.identifier;
        console.log('Received delete request with identifier:', identifier);

        let query = {};
        let foundDocument = null;

        // Check if the identifier is a valid ObjectId (24 characters hex string)
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            try {
                // First try directly with the ObjectId
                query = { _id: new ObjectId(identifier) };
                console.log('Attempting to find by MongoDB ObjectId:', identifier);
                foundDocument = await collection.findOne(query);
                console.log('Found by ObjectId:', !!foundDocument);
            } catch (err) {
                console.error('Error converting to ObjectId:', err);
                // If error in ObjectId conversion, continue to next approach
            }
        }
        
        // If not found by ObjectId, try by persona_name
        if (!foundDocument) {
            query = { persona_name: decodeURIComponent(identifier) };
            console.log('Attempting to find by persona_name:', decodeURIComponent(identifier));
            foundDocument = await collection.findOne(query);
            console.log('Found by persona_name:', !!foundDocument);
        }
        
        // If still not found, try by profileId field
        if (!foundDocument && identifier.match(/^\d+$/)) {
            query = { profileId: identifier };
            console.log('Attempting to find by profileId field:', identifier);
            foundDocument = await collection.findOne(query);
            console.log('Found by profileId field:', !!foundDocument);
        }

        // If we found the document, delete it by its _id for precision
        if (foundDocument) {
            console.log('Found document to delete:', {
                _id: foundDocument._id,
                persona_name: foundDocument.persona_name,
                profileId: foundDocument.profileId
            });
            
            // Use _id for precise deletion
            const deleteResult = await collection.deleteOne({ _id: foundDocument._id });
            console.log('Delete result:', deleteResult);
            
            if (deleteResult.deletedCount === 1) {
                console.log('Successfully deleted persona');
                res.json({ 
                    success: true, 
                    message: 'Persona deleted successfully',
                    deletedId: foundDocument._id.toString()
                });
            } else {
                console.log('Delete operation failed though document was found');
                res.status(500).json({ 
                    success: false, 
                    error: 'Delete operation failed' 
                });
            }
        } else {
            console.log('No document found to delete');
            res.status(404).json({ 
                success: false, 
                error: 'Persona not found' 
            });
        }
    } catch (error) {
        console.error("Error deleting persona from MongoDB:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Insert endpoint
app.post('/api/insert', async (req, res) => {
    try {
        console.log("insert endpoint hit");
        console.log("Inserting message:", req.body);
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("messages");
        const result = await collection.insertOne(req.body);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Error inserting to MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Store chat messages endpoint
app.post('/api/chats/store', async (req, res) => {
    try {
        const { getDB } = require('./config/db');
        const db = await getDB();
        const collection = db.collection("chats");
        
        const messageData = {
            ...req.body,
            timestamp: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Try to find an existing document for this user and persona
        const existingChat = await collection.findOne({ 
            uid: messageData.uid,
            persona: messageData.persona // Add persona to the query
        });
        
        if (existingChat) {
            // If document exists, push the new message to the messages array
            const result = await collection.updateOne(
                { 
                    uid: messageData.uid,
                    persona: messageData.persona // Add persona to the query
                },
                { 
                    $push: { messages: messageData },
                    $set: { updatedAt: new Date() }
                }
            );
            res.json({ success: true, result });
        } else {
            // If no document exists, create a new one with the first message
            const result = await collection.insertOne({
                uid: messageData.uid,
                userEmail: messageData.userEmail,
                persona: messageData.persona, // Store persona information
                messages: [messageData],
                createdAt: new Date(),
                updatedAt: new Date()
            });
            res.json({ success: true, result });
        }
    } catch (error) {
        console.error("Error storing chat in MongoDB:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Database connection and server start
async function startServer() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

startServer(); 