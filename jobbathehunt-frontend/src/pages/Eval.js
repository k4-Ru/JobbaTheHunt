import { useLocation, useNavigate } from "react-router-dom"; // Import useLocation for accessing passed data
import { use, useEffect, useState } from "react";
import { onAuthStateChanged, auth } from "../components/auth"; // adjust path if needed
import axios from "axios";

const Eval = () => {
  const location = useLocation(); // Access the location state
  const navigate = useNavigate();

  const sessionId = location?.state?.sessionId; // Get sessionId from location.state
  const userId = location?.state?.userId; // Get userId from location.state

  const [currentUser, setCurrentUser] = useState(null);
  const [rating, setRating] = useState(null);
  const [evaluation, setEvaluation] = useState("");

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("evaluation ongoing");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        console.log("User signed in:", user.uid);
      } else {
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  useEffect(() => {
    console.log("useEffect triggered in Eval, currentUser:", currentUser, "sessionId:", sessionId, "userId:", userId);

    if (!sessionId) {
      console.log("Missing user or session details. Returning.");
        navigate("/home", { replace: true });
      return;
    }

    else if (!userId && !currentUser) {
      console.log("No userId or currentUser found. Returning.");
      navigate("/login", { replace: true });
      return;
    }

    const fetchEval = async () => {
      try {
        console.log("Sending request to fetch evaluation:", { userId, sessionId });

        const res = await axios.post("http://localhost:5000/eval", {
          userId,
          sessionId, 
        });

        console.log("Received response from eval API:", res.data);

        if (res.data.status === "completed") {
          console.log("Evaluation data received:", res.data);
          setRating(res.data.rating);
          setEvaluation(res.data.evaluation);
        } else {
          console.log("Status not completed. Received:", res.data.status);
        }
      } catch (err) {
        console.error("Failed to fetch evaluation:", err);
        setIsChecking(false); // Set loading to false on error
      }
    };

    fetchEval();
  }, [currentUser, sessionId, userId]);//userid for getting the evaluation from the current user, userid = currentUser


  if (isChecking) {
    return <p>Checking...</p>;
  }

  
  if (!currentUser || !sessionId || !userId ) {
    return null;
  }
  

  return (
    <div>
      {rating ? (
        <>
          <h2>Your Rating: {rating}</h2>
          <p>Evaluation: {evaluation}</p>
        </>
      ) : (
        <p>Evaluating you...</p>
      )}

      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Eval;
