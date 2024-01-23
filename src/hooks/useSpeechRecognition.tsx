"use client";
import React from "react";

export default function useSpeechRecognition() {
  const [listening, setListening] = React.useState<boolean>(false);
  const [browserSupportsSR, setBrowserSupportsSR] =
    React.useState<boolean>(false);
  const [transcript, setTranscript] = React.useState<string>("");
  const [isMicAvailable, setIsMicAvailable] = React.useState<boolean>(false);

  let recognition: any =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognitionInstance = new recognition();

  const requestMicrophoneAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setIsMicAvailable(true);
        setBrowserSupportsSR(true);
        console.log("Microphone access granted");
      })
      .catch((err: any) => {
        console.log(`Error requesting microphone: ${err}`);
        setBrowserSupportsSR(false);
      });
  };

  const startListening = () => {
    setListening(true);
    recognitionInstance.start();
  };

  const stopListening = () => {
    setListening(false);
    recognitionInstance.stop();
  };

  React.useEffect(() => {
    if (!recognitionInstance) {
      console.error("SpeechRecognition is not supported in this browser.");
      return;
    }
  }, []);

  React.useEffect(() => {
    if (listening) {
      console.log("Effect triggered");

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.addEventListener("result", (event: any) => {
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        setTranscript(transcript);
      });

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended");
        // You can choose to restart recognitionInstance if needed
        // recognitionInstance.start();
      };

      recognitionInstance.onerror = (event: any) => {
        console.log(`Speech recognition error detected: ${event.error}`);
        console.log(`Additional information: ${event.message}`);
      };

      recognitionInstance.start();
    }

    return () => {
      recognitionInstance.stop();
    };
  }, [listening]);

  return {
    listening,
    browserSupportsSR,
    transcript,
    isMicAvailable,
    requestMicrophoneAccess,
    startListening,
    stopListening,
  };
}
