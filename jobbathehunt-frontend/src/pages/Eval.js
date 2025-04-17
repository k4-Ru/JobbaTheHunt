import React, { useEffect, useState } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const Eval = () => {
  const { sessionId } = useParams(); // get sessionId from the URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState(null); // hold response from backend

  useEffect(() => {
    const getEval = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/eval/${sessionId}`);
        setEvaluation(res.data); // assuming response has { rating, evaluation }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching evaluation:", error);
        setLoading(false);
      }
    };

    getEval();
  }, [sessionId]);

  if (loading) return <p>Loading...</p>;
  if (!evaluation) return <p>No evaluation found.</p>;

  return (
    <div>
      <h1>Score: {evaluation.rating}/10</h1>
      <p>Evaluation: {evaluation.evaluation}</p>
        <button onClick={() => navigate("/home")}>Go to Home</button>
    </div>
  );
};

export default Eval;
