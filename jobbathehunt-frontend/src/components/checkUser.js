
const checkUser = async (req, res, next) => {
    try {
      const { firebase_uid } = req.user; // Assuming Firebase auth middleware sets req.user
  
      // Get user ID from local database
      const [userRows] = await global.db.execute("SELECT id FROM users WHERE firebase_uid = ?", [firebase_uid]);
      
      if (userRows.length === 0) {
        return res.status(401).json({ error: "User not found" });
      }
   
      const userId = userRows[0].id;
  
      // Check if user_id exists in user_preferences
      const [prefRows] = await global.db.execute("SELECT 1 FROM user_preferences WHERE user_id = ?", [userId]);
  
      if (prefRows.length === 0) {
        return res.status(403).json({ redirect: "/choose", error: "User has not chosen preferences yet." });
      }
  
      req.userId = userId; // Store user ID for later use
      next();
    } catch (error) {
      console.error("Error checking user preferences:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
