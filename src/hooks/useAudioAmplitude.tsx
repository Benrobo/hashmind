"use client";
import React, { useEffect } from "react";

// ! Having issue with this hook below, would fix this later on.

type AudioAmpProps = {
  file: Blob;
  enabled?: boolean;
};

export default function useAudioAmplitude({ file, enabled }: AudioAmpProps) {
  const [amplitude, setAmplitude] = React.useState<number>(0);
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);

  //   if (!file) {
  //     throw new Error("file is required");
  //   }

  let animationFrameId;
  let audioSource: never | AudioBufferSourceNode;
  let analyzer: never | AnalyserNode;

  useEffect(() => {
    if (!enabled || !file) {
      console.error("file is required");
      return;
    }

    const audioCtx = new AudioContext();
    const fileReader = new FileReader();
    analyzer = audioCtx.createAnalyser();

    fileReader.onload = (e) => {
      console.log({ audioCtx });

      audioCtx.decodeAudioData(e.target!.result as ArrayBuffer, (buffer) => {
        console.log({ buffer });
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = buffer;
        audioSource.connect(analyzer);
        analyzer.connect(audioCtx.destination);

        analyzer.fftSize = 256;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        if (isPlaying) stopAudio();
        else audioSource.start(0);

        setIsPlaying(true);

        // audioSource?.onended = () => {
        //   console.log("audio source ended");
        // };

        // update visualization
        function updateVisualization() {
          analyzer?.getByteFrequencyData(dataArray);

          // Calculate average amplitude
          const averageAmplitude =
            dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

          setAmplitude(averageAmplitude);

          animationFrameId = requestAnimationFrame(updateVisualization);
        }

        animationFrameId = requestAnimationFrame(updateVisualization);
      });
    };

    fileReader.onerror = (e) => {
      console.log(`Error reading file: ${e.target!.error}`);
    };

    fileReader.readAsArrayBuffer(file);

    return () => {
      if (audioSource) {
        audioSource.stop();
        audioSource.disconnect();
      }
    };
  }, [file]);

  const stopAudio = () => {
    audioSource?.stop();
    setIsPlaying(false);
  };

  const playAudio = () => {
    // @ts-ignore
    if (audioSource.paused && !isPlaying) audioSource.play();

    setIsPlaying(true);
  };

  return { amplitude, isPlaying, stopAudio, playAudio };
}

export function useGetBlob(path: string) {
  const [blob, setBlob] = React.useState<Blob | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [blobUrl, setBlobUrl] = React.useState<string>("");

  React.useEffect(() => {
    const getBlob = async () => {
      try {
        setLoading(true);
        const res = await fetch(path);
        const data = await res.blob();
        setLoading(false);
        setBlob(data);
        setBlobUrl(URL.createObjectURL(data));
      } catch (e: any) {
        setLoading(false);
        setError(e.message);
      }
    };

    getBlob();
  }, [path]);

  return { blob, blobUrl, loading, error };
}

export function useAudioAmplitude3() {
  const audioRef = React.useRef<HTMLAudioElement>(null || new Audio());
  const [amp, setAmp] = React.useState<number>(0);

  let audioSource: never | MediaElementAudioSourceNode;
  let analyser: never | AnalyserNode;
  let dataArray: never | Uint8Array;
  let animationFrameId;

  React.useEffect(() => {
    if (!audioRef?.current) return;

    const audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();

    if (!audioSource) {
      audioSource = audioCtx.createMediaElementSource(audioRef?.current);
      analyser = audioCtx.createAnalyser();
      audioSource.connect(analyser);
      analyser.connect(audioCtx.destination);
    }

    analyser.fftSize = 256; // fast fourier transform size (how many bins)
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    audioRef.current?.play();

    audioRef.current.onended = () => {
      audioRef.current?.pause();
      //   audioRef.current?.currentTime = 0;
      console.log("audio ended");
    };
    audioRef.current.onplay = () => {
      console.log("audio playing");
    };

    // update visualization
    function processAudio() {
      analyser?.getByteFrequencyData(dataArray);

      // Calculate average amplitude
      const averageAmplitude =
        dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;

      //   console.log({ averageAmplitude });
      setAmp(averageAmplitude);

      animationFrameId = requestAnimationFrame(processAudio);
    }

    animationFrameId = requestAnimationFrame(processAudio);

    return () => {
      audioSource.disconnect();
      analyser.disconnect();
    };
  }, []);

  return { audioRef, amp };
}

export function useAudioAmplitude2() {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [amp, setAmp] = React.useState<number>(0);

  let audioSource: MediaElementAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let dataArray: Uint8Array | null = null;
  let animationFrameId: number | null = null;

  useEffect(() => {
    if (!audioRef?.current) return;

    const audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();

    // Disconnect existing nodes
    if (audioSource) {
      audioSource.disconnect();
      analyser.disconnect();
      console.log("disconnecting existing nodes");
    }

    audioSource = audioCtx.createMediaElementSource(audioRef?.current);
    analyser = audioCtx.createAnalyser();
    audioSource.connect(analyser);
    analyser.connect(audioCtx.destination);

    // if (!audioSource) {
    //   audioSource = audioCtx.createMediaElementSource(audioRef?.current);
    //   analyser = audioCtx.createAnalyser();
    //   audioSource.connect(analyser);
    //   analyser.connect(audioCtx.destination);
    // }

    analyser.fftSize = 64; // fast fourier transform size (how many bins)
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Event listeners for audio playback
    const handleEnded = () => {
      console.log("audio ended");
      cancelAnimationFrame(animationFrameId!);
    };

    const handlePlay = () => {
      console.log("audio playing");
      // Start the visualization loop only when audio starts playing
      //   animationFrameId = requestAnimationFrame(processAudio);
    };

    // Attach event listeners
    audioRef.current.addEventListener("ended", handleEnded);
    audioRef.current.addEventListener("play", handlePlay);

    return () => {
      // Clean up event listeners
      audioRef.current?.removeEventListener("ended", handleEnded);
      audioRef.current?.removeEventListener("play", handlePlay);

      // Disconnect audio nodes
      audioSource?.disconnect();
      analyser?.disconnect();

      // Close the AudioContext
      audioCtx.close();
    };
  }, [audioRef.current]);

  // Update visualization
  //   const processAudio = () => {
  //     analyser?.getByteFrequencyData(dataArray!);

  //     // Calculate average amplitude
  //     const averageAmplitude =
  //       dataArray!.reduce((sum, value) => sum + value, 0) / dataArray!.length;

  //     setAmp(averageAmplitude);

  //     animationFrameId = requestAnimationFrame(processAudio);
  //   };

  return { audioRef, amp };
}
