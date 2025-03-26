import { auth } from "../firebase"; 
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";

const provider = new GoogleAuthProvider();

const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        name: name,
        profile_pic: null,
      }),
    });

    console.log("User registered and stored in database:", user);
  } catch (error) {
    console.error("Registration failed:", error);
  }
};









// Login User with Email & Password
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login successful:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("❌ Login failed:", error);
    throw error;
  }
};








//Google Authentication
const signUpWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await fetch("http://localhost:5000/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firebase_uid: user.uid,
        email: user.email,
        name: user.displayName,
        profile_pic: user.photoURL,
      }),
    });

    console.log("✅ Google acc", user);
  } catch (error) {
    console.error("❌ Google Sign-Up Error:", error);
  }
};








export { registerUser, signUpWithGoogle, loginUser, onAuthStateChanged, auth};
