require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");
const mysql = require("mysql2/promise");

const  OpenAIApi = require("openai");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());





const openai = new OpenAIApi(
  ({
    apiKey: process.env.OPENAI_API_KEY,
  })
);






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

    const values = [firebase_uid, email, name, profile_pic, 1];

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






//debugging testing ng skills and interest ni  user
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

















//chooseYourPath , insert to user_preferences table
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












































app.post("/api/interview", async (req, res) => {
  const { jobRole, userId, userResponse } = req.body;
  console.log("Received data:", { jobRole, userId, userResponse });
  
  
  const firstPrompt = `you are a senior ${jobRole} 
      interviewing a person for the ${jobRole} role within a company. 
      what are the technical, behavioral questions you would ask the candidates? 
      give me at least 2 questions in technical and behavioral categories
      Here are rules:
      Talk like a person, imagine this is just a normal conversation.
      Do not type like a robot, be friendly and casual (no numbering, bullet points, etc.). 
      Do not repeat questions (because the conversation might loop)
      Start by greeting the user and when asking does include a number on the questions.
      Do not ask generic questions, make it unique and specific to the job role.
      Start by asking the first a question. Ask a question one by one only (seperate messages).
      Ask follow-up questions if needed.
      After all the main 2 questions are answered, provide a final evaluation (text) and a rating from 0 to 10.0. 
      Do not ever give an evaluation and a rating if not all questions have been answered.
      Do not ever mentioned that you are going to give a rating and an evaluation.

      Seperate the rating and evaluation from the last question into a seperate message.

      The Rating and Evaluation format should only be like this: Rating: "0-10.0" and Evaluation: "text".`;
  try {
    // Validate required fields
    if (!jobRole || !userId) {
      return res.status(400).json({ error: "jobRole and userId are required." });
    }

    // Check if job role exists
    const [roleRow] = await db.query("SELECT id FROM job_roles WHERE role_name = ?", [jobRole]);
    const jobRoleId = roleRow.length > 0 ? roleRow[0].id : null;

    if (!jobRoleId) {
      return res.status(400).json({ error: "Job role does not exist." });
    }

    // Check if there's an ongoing session
    const [sessions] = await db.query(
      "SELECT * FROM interview_sessions WHERE user_id = ? AND status = 'ongoing'",
      [userId]
    );

    const existingSession = sessions[0];
    let sessionId;

    if (!existingSession) {

      const [result] = await db.query(
        "INSERT INTO interview_sessions (user_id, job_role_id, status) VALUES (?, ?, ?)",
        [userId, jobRoleId, 'ongoing']
      );

      sessionId = result.insertId;
      console.log("New session started, with ID:", sessionId);


      

      /*const firstPrompt = `Talk like a person, imagine this is just a normal conversation.
      Do not type like a robot, be friendly and casual (no numbering, bullet points, etc.). 
      Do not repeat questions (because the conversation might loop)
      You are an interviewer for the role of ${jobRole}. 
      Start by greeting the user and when asking does include a number on the questions.
      Do not ask generic questions, make it unique and specific to the job role.
      Have a total of 2 technical-based questions (you can add more questions if needed). 
      Start by asking the first a question. Ask a question one by one only.

      Ask follow-up questions if needed. 
      After all the main 2 questions are answered, 
      provide a final evaluation (text) and a rating from 0 to 10.0.
      Do not ever give an evaluation and a rating if not all questions have been answered.
      Do not ever mentioned that you are going to give a rating and an evaluation.
      Seperate the rating and evaluation from the questions
      
      The Rating and Evaluation format should only be like this: Rating: "0-10.0" and Evaluation: "text".`; */




      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: firstPrompt }],
      });

      const firstQuestion = response.choices[0].message.content;

      await db.query(
        "INSERT INTO interview_messages (session_id, role, message) VALUES (?, ?, ?)",
        [sessionId, 'system', firstQuestion]
      );

      return res.json({ question: firstQuestion, sessionId });
    } else {
      // Use existing session
      sessionId = existingSession.id;
      console.log("Using existing session with ID:", sessionId);
    }

    // If no userResponse, just return the last system message
    if (!userResponse) {
      const [lastSystemMessage] = await db.query(
        "SELECT message FROM interview_messages WHERE session_id = ? AND role = 'system' ORDER BY id DESC LIMIT 1",
        [sessionId]
      );

      return res.json({
        question: lastSystemMessage[0]?.message || "No previous question found.",
        sessionId
      });
    }


    // Save the user response
    await db.query(
      "INSERT INTO interview_messages (session_id, role, message) VALUES (?, ?, ?)",
      [sessionId, 'user', userResponse]
    );
    console.log("User response saved:", userResponse); //debug



    const [pastMessages] = await db.query(
      "SELECT role, message FROM interview_messages WHERE session_id = ? ORDER BY id ASC",
      [sessionId]
    );
    
    // Build the message history
    const openAIMessages = [
      { role: "system", content: firstPrompt },
      ...pastMessages.map(row => ({
        role: row.role,
        content: row.message
      }))
    ];
    

    //gpt again

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openAIMessages,
    });
    

    const message = response.choices[0].message.content;

    console.log(`Tokens used - Prompt: ${response.usage?.prompt_tokens || 'N/A'}, Completion: ${response.usage?.completion_tokens || 'N/A'}, Total: ${response.usage?.total_tokens || 'N/A'}`);
    console.log("Next Question or Final Message:", message);

    await db.query(
      "INSERT INTO interview_messages (session_id, role, message) VALUES (?, ?, ?)",
      [sessionId, 'system', message]
    );

    const ratingMatch = message.match(/Rating:\s*([0-9]+(?:\.[0-9])?)/i);
    const evaluationMatch = message.match(/Evaluation:\s*(.+)/is);

    if (ratingMatch && evaluationMatch) {
      const rating = parseFloat(ratingMatch[1]);
      const evaluation = evaluationMatch[1].trim();

      await db.query(
        "UPDATE interview_sessions SET status = ?, rating = ?, evaluation = ? WHERE id = ?",
        ['completed', rating, evaluation, sessionId]
      );

      console.log("Interview completed. Rating and evaluation saved."); // ⭐ ADDED: Confirmation log


    }

    return res.json({ question: message, sessionId });

  } catch (error) {
    console.error("Error in /api/interview:", error.message || error);

    if (error.response?.status === 429) {
      return res.status(429).json({ error: "Quota exceeded. Please try again later." });
    } else if (error.response?.status === 400) {
      return res.status(400).json({ error: "Invalid request to OpenAI API." });
    } else {
      return res.status(500).json({ error: "Failed to process the request. Please try again later." });
    }
  }
});




/*
mysql> describe interview_sessions;
+-------------+-----------------------------------------+------+-----+---------------------+----------------+
| Field       | Type                                    | Null | Key | Default             | Extra          |
+-------------+-----------------------------------------+------+-----+---------------------+----------------+
| id          | int(11)                                 | NO   | PRI | NULL                | auto_increment |
| user_id     | varchar(255)                            | NO   | MUL | NULL                |                |
| job_role_id | int(11)                                 | NO   | MUL | NULL                |                |
| started_at  | datetime                                | YES  |     | current_timestamp() |                |
| status      | enum('ongoing','completed','abandoned') | YES  |     | NULL                |                |
| rating      | decimal(3,1)                            | YES  |     | NULL                |                |
| evaluation  | text                                    | YES  |     | NULL                |                |
+-------------+-----------------------------------------+------+-----+---------------------+----------------+
7 rows in set (0.12 sec)

*/






app.get ("/eval/:sessionId",  async (req, res) =>{

  const {sessionId} = req.params;

  try {
    const [result] = await db.execute("SELECT * FROM interview_sessions WHERE id = ?", [sessionId]);

    if (result.length === 0) {
      return res.status(404).json({ error: "not found" }); 
    }

    res.status(200).json(result[0]);
  } catch (error) {
    console.error("Error fetching:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});








//unused as of 4-16-2025

app.post("/checkSession", (req, res) => {
  const { userId } = req.body;

  const query = "SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT 1";
  pool.execute(query, [userId], (err, results) => {
    if (err) {
      console.error("Error checking session:", err);
      return res.status(500).json({ message: "Error checking session." });
    }

    if (results.length > 0) {
      const session = results[0];
      if (session.status === "abandoned") {
        // If the session was abandoned, return it
        return res.status(200).json(session);
      } else {
        // Otherwise, continue with the ongoing session
        return res.status(200).json(session);
      }
    } else {
      // No session found for this user
      return res.status(404).json({ message: "No session found." });
    }
  });
});










app.post("/markAbandoned", async (req, res) => {
  const { sessionId } = req.body;  // The sessionId to mark as abandoned

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE interview_sessions SET status = 'abandoned' WHERE id = ?",
      [sessionId]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Session marked as abandoned." });
      console.log("Session  Id has been abandoned:", sessionId);
    } else {
      return res.status(404).json({ error: "Session not found." });
    }
  } catch (error) {
    console.error("Error marking session as abandoned:", error.message || error);
    return res.status(500).json({ error: "Failed to mark session as abandoned." });
  }
});




















app.listen(PORT, () => console.log(`Server running on port ${PORT}`));