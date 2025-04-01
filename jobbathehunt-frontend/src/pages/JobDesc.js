import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/sidebar";

const JobDesc = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/job-role/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!job) {
    return <p>Job not found</p>;
  }

  // Split description into lines
  const lines = job.description.split("\n");

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", flex: 1 }}>
        <h1>{job.role_name}</h1>

        {/* Display the clickable roadmap link if it exists */}
        {job.roadmap && (
          <p>
            <a href={job.roadmap} target="_blank" rel="noopener noreferrer">
              {job.roadmap}
            </a>
          </p>
        )}

        <div>
          {lines.map((line, index) =>
            line.startsWith("-") ? (
              <li key={index}>{line.substring(1).trim()}</li> // Bullet point
            ) : (
              <p key={index}>{line}</p> // Regular text
            )
          )}
        </div>

        {/* Buttons Section */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/interview")}
            style={{ marginRight: "10px", padding: "10px 20px", cursor: "pointer" }}
          >
            Back
          </button>

          {/* ✅ New "Start Interview" button */}
          <button
            onClick={() => navigate("/speech")}
            style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "blue", color: "white", border: "none", borderRadius: "5px" }}
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDesc;
