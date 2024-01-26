"use client";
import React from "react";

export default function useSpeechRecognition() {
  const [listening, setListening] = React.useState<boolean>(false);
  const [browserSupportsSR, setBrowserSupportsSR] =
    React.useState<boolean>(false);
  const [isMicAvailable, setIsMicAvailable] = React.useState<boolean>(false);
  const mediaRecorder = React.useRef<MediaRecorder | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = React.useState([]);
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);

  React.useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const requestMicrophoneAccess = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsMicAvailable(true);
        setBrowserSupportsSR(true);
        setStream(stream as any);
        console.log("Microphone access granted");
      })
      .catch((err: any) => {
        console.log(`Error requesting microphone: ${err}`);
        setBrowserSupportsSR(false);
      });
  };

  const startListening = async () => {
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current?.resume();
    }

    const media = new MediaRecorder(stream as any);

    //set the MediaRecorder instance to the mediaRecorder ref
    mediaRecorder.current = media;
    //invokes the start method to start the recording process
    mediaRecorder.current.start();
    let localAudioChunks: any[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks as any);
  };

  const stopListening = (
    callback: (data: { blob: Blob; blobUrl: string | null }) => void
  ) => {
    if (mediaRecorder.current) {
      mediaRecorder.current?.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        callback({ blob: audioBlob, blobUrl: audioUrl });
        setBlob(audioBlob);
        setAudioChunks([]);
      };
    } else console.log("No media recorder", mediaRecorder);
  };

  return {
    startListening,
    stopListening,
    requestMicrophoneAccess,
    blob,
  };
}
