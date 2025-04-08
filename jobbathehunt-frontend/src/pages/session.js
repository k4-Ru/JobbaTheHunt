import React, { useState, useEffect } from "react";
import Transcription from "../components/transcription";

const Session = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  let recognition = null;

  useEffect(() => {


    // Check if the browser can speech to textt
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setText(transcript.trim()); 
    };


    recognition.start();

    return () => recognition.abort();
  }, []);

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start(); 
      }
      setIsListening(!isListening); // Toggle the listening state
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Speech-to-Text</h1>
      <button
        onClick={toggleListening}
        className={`px-4 py-2 mt-4 rounded-lg text-white ${
          isListening ? "bg-red-500" : "bg-green-500"
        }`}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      <Transcription text={text} />
    </div>
  );
};

export default Session;

