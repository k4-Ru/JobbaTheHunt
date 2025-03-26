import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChooseYourPath({ userId }) {
  const [skills] = useState([  //"setskills" d nagagamit
    "Designing", 
    "Website Creation", 
    "Games", 
    "Database Creation",
    "Java", 
    "C#", 
    "JavaScript", 
    "Html/CSS", 
    "UI & UX"
    //note: dagadag pa
  ]);

  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      console.log("UID:", userId);
      setLoading(false);
    } else {
      console.error("No user ID detected");
      navigate("/login");  // Redirect pag userId
    }
  }, [userId, navigate]);

  const toggleSkill = (skill) => {

    // Toggle the skill
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)   // Deselect
        : [...prev, skill]                  // Select
    );
  };

  const saveSkills = async () => {
    if (!userId) {
      console.error("Missing user ID.");
      alert("Failed to save: No user ID found.");
      return;
    }

    if (selectedSkills.length === 0) {
      alert("Please select at least one skill.");
      return;
    }

    try {
      console.log("Sending skills:", { userId, skills: selectedSkills });

      const response = await fetch("http://localhost:5000/user-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skills: selectedSkills }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Skills saved successfully!");
        navigate("/home");
      } else {
        console.error("Error saving skills:", data);
        alert(`Error: ${data.error || "Failed to save skills"}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to save skills.");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Choose Your Skills & Interests</h2>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {skills.map((skill) => (
          <button
            key={skill}
            onClick={() => toggleSkill(skill)}
            className={selectedSkills.includes(skill) ? "selected" : ""}
            style={{
              margin: "10px",
              padding: "10px 20px",
              backgroundColor: selectedSkills.includes(skill) ? "blue" : "white",
              color: selectedSkills.includes(skill) ? "white" : "black",
              border: "1px solid black",
              cursor: "pointer",
              transition: "0.3s"
            }}
          >
            {skill}
          </button>
        ))}
      </div>

      <button
        onClick={saveSkills}
        style={{
          marginTop: "20px",
          padding: "12px 30px",
          backgroundColor: "green",
          color: "white",
          border: "none",
          cursor: "pointer",
          transition: "0.3s"
        }}
      >
        Save
      </button>
    </div>
  );
}




export default ChooseYourPath;
