import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";


const Interview = () => {
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/job-roles");
        setJobRoles(response.data);
      } catch (error) {
        console.error("Error fetching job roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobRoles();
  }, []);

  const SelectedJob = (id) => {
    navigate(`/job/${id}`);   // goto job details page
  };

  if (loading) {
    return <p>Loading...</p>;
  }







  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ padding: "20px" }}>
        <h1>Job Roles</h1>
        <div>
          {jobRoles.map((job) => (
            <button
              key={job.id}
              onClick={() => 
                SelectedJob(job.id)}  // Go to JobDetails page
              style={{ margin: "10px", padding: "10px 20px", cursor: "pointer" }}
            >
              {job.role_name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Interview;
