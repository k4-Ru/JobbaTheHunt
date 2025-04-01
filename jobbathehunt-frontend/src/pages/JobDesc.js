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

  return (
    <div style={{ display: "flex" }}>  
    
     <Sidebar/>

      <div style={{ padding: "20px" }}>
        <h1>{job.role_name}</h1>
      <p>{job.description}</p>



      <button onClick={() => navigate("/interview")} style={{ marginTop: "20px", cursor: "pointer" }}>
        Back
      </button>
      </div>
      
    </div>
  );
};

export default JobDesc;
