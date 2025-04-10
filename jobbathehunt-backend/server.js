require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());







// Firebase Admin SDK Initialization
const firebaseConfigPath = process.env.FIREBASE_CREDENTIALS
  ? path.resolve(process.env.FIREBASE_CREDENTIALS)
  : path.resolve(__dirname, "firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(require(firebaseConfigPath)),
});











//Database Connection
(async () => {
  try {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("Missing required database environment variables!");
    }
    
    global.db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME,
    });
    console.log("Connected to Database");
  } catch (error) {
    console.error("Database Connection Error:", error);
    process.exit(1);
  }
})();











//pfp ng user 
app.get("/get-pfp/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const [result] = await global.db.execute(
      "SELECT profile_pic FROM users WHERE firebase_uid = ?",
      [uid]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ profileImage: result[0].profile_pic });

  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});









app.post("/register", async (req, res) => {
  const { firebase_uid, email, name, profile_pic = null } = req.body;

  if (!firebase_uid || !email || !name) {
    return res.status(400).json({ error: "Invalid request data" });
  }

  try {
    // Check if the user already exists
    const [existingUser] = await db.execute(
      "SELECT id, verified FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      const user = existingUser[0];

      if (user.verified === 0) {
        // If the user exists but is not verified, resend the verification email
        console.log(`Resending verification email to ${email}`);
        const link = await admin.auth().generateEmailVerificationLink(email);
        return res.status(200).json({
          message: "Verification email resent. Please check your inbox.",
        });
      } else {
        // If the user is already verified, return an error
        return res.status(409).json({ error: "Account already exists. Please log in." });
      }
    }

    // If the user does not exist, create a new user
    const query = `
      INSERT INTO users (firebase_uid, email, name, profile_pic, verified)
      VALUES (?, ?, ?, ?, ?)
    `;

    const values = [firebase_uid, email, name, profile_pic, 0]; // verified = 0 by default

    await db.execute(query, values);

    console.log("User inserted into MySQL:", { firebase_uid, email, name, profile_pic });
    res.status(201).json({ success: true, message: "User registered successfully" });

  } catch (error) {
    console.error("Error inserting into MySQL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});











app.post("/auth/google", async (req, res) => {
  try {
    const { firebase_uid, email, name, profile_pic } = req.body;

    if (!firebase_uid || !email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Store or update the user in the database
    const query = `
      INSERT INTO users (firebase_uid, email, name, profile_pic, verified)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        name = VALUES(name), 
        profile_pic = VALUES(profile_pic), 
        verified = VALUES(verified)
    `;

    const values = [firebase_uid, email, name, profile_pic, 1]; // Set verified = 1 for Google users

    await global.db.execute(query, values);

    res.status(200).json({ message: "User stored successfully" });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});









app.post("/update-verification", async (req, res) => {
  const { firebase_uid } = req.body;

  if (!firebase_uid) {
    return res.status(400).json({ error: "Firebase UID is required." });
  }

  try {
    console.log(`Updating verification status`);

    // Check if the user exists and is already verified
    const [user] = await db.execute("SELECT verified FROM users WHERE firebase_uid = ?", [firebase_uid]);

    if (user.length === 0) {
      console.error(`No user found with Firebase UID: ${firebase_uid}`);
      return res.status(404).json({ error: "User not found." });
    }

    if (user[0].verified) {
      console.log(`User ${firebase_uid} is already verified.`);
      return res.status(200).json({ message: "User is already verified." });
    }

    // Update the verification status
    const query = "UPDATE users SET verified = 1 WHERE firebase_uid = ?";
    await db.execute(query, [firebase_uid]);

    // Return a simple success response
    res.status(200).json({ message: "User verification status updated successfully." });
  } catch (error) {
    console.error("Error updating verification status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
















app.post("/check-preferences", async (req, res) => {
  const { firebase_uid } = req.body;

  if (!firebase_uid) {
    return res.status(400).json({ error: "Missing Firebase UID" });
  }

  try {
    // Use a JOIN to fetch the user's preferences in a single query
    const [result] = await db.execute(
      `
      SELECT u.id AS userId, u.verified, COUNT(p.id) AS preferencesCount
      FROM users u
      LEFT JOIN user_preferences p ON u.id = p.user_id
      WHERE u.firebase_uid = ?
      GROUP BY u.id
      `,
      [firebase_uid]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const { userId, verified, preferencesCount } = result[0];

    if (!verified) {
      return res.status(403).json({ error: "User is not verified" });
    }

    res.json({ hasPreferences: preferencesCount > 0 });
  } catch (error) {
    console.error("Error checking preferences:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






//testing ng skills and interest ni  user
app.get("/user-preferences/:firebase_uid", async (req, res) => {
  try {
    const { firebase_uid } = req.params;

    if (!firebase_uid) {
      return res.status(400).json({ error: "Firebase UID is required" });
    }


    const [userResult] = await db.execute("SELECT id FROM users WHERE firebase_uid = ?", [firebase_uid]);

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult[0].id;

    // Fetch user preferences
    const [preferencesResult] = await db.execute("SELECT skill_or_interest FROM user_preferences WHERE user_id = ?", [userId]);

    res.status(200).json({
      account: true,
      userId: userId,
      preferences: preferencesResult.map((row) => row.skill_or_interest),
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

















//chooseYourPath
app.post("/user-preferences", async (req, res) => {
  try {
    const { userId, skills } = req.body;

    if (!userId || !skills || skills.length === 0) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    const [userResult] = await db.execute(
      "SELECT id FROM users WHERE firebase_uid = ?", 
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const localUserId = userResult[0].id; 

    const placeholders = skills.map(() => "(?, ?)").join(", ");  // (userId, skill) pairs
    const query = `INSERT INTO user_preferences (user_id, skill_or_interest) VALUES ${placeholders}`;

    const values = skills.flatMap(skill => [localUserId, skill]);

    await db.execute(query, values);

    res.status(201).json({ success: true, message: "Skills saved successfully" });

  } catch (error) {
    console.error("Error saving skills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});











// Get user preferences
app.get("/user-preferences/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [results] = await db.execute("SELECT skill_or_interest FROM user_preferences WHERE user_id = ?", [userId]);

    res.status(200).json(results.map((row) => row.skill_or_interest));
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});













//teesting backend only, not necessary
app.get("/auth/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const [rows] = await global.db.execute("SELECT * FROM users WHERE firebase_uid = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});










//homepage section



//interview page section

app.get("/job-roles", async (req, res) => {
  try {
    const [roles] = await db.execute("SELECT id, role_name FROM job_roles");
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error fetching job roles:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/job-role/:id", async (req, res) => {     //job by id
  const { id } = req.params;

  try {
    const [result] = await db.execute("SELECT * FROM job_roles WHERE id = ?", [id]);

    if (result.length === 0) {
      return res.status(404).json({ error: "Job role not found" }); 
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching job role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});






app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
