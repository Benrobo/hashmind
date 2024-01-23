"use client";
import BlurBgRadial from "@/components/blurBgRadial";
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
} from "@/components/flex";
import WaveLoader from "@/components/loader";
import ReactSiriwave from "@/components/wave/SiriWave";
import { useDataContext } from "@/context/DataContext";
import useAudioAmplitude, {
  useAudioAmplitude2,
  useGetBlob,
} from "@/hooks/useAudioAmplitude";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { cn } from "@/lib/utils";
import { Mic, MoveLeft, Pause } from "lucide-react";
import Link from "next/link";
import React from "react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

export default function AI() {
  const { hideToolBar } = useDataContext();
  const [humanSpeechs, setHumanSpeechs] = React.useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = React.useState<boolean>(false);
  const [amplitude, setAmplitude] = React.useState<number>(0);
  const [audioUrl, setAudioUrl] = React.useState();
  const [speaking, setSpeaking] = React.useState<boolean>(false);
  const audioElmRef = React.useRef<HTMLAudioElement>(null);
  const [loader, setLoader] = React.useState<boolean>(false);
  const [aiInvoke, setAiInvoke] = React.useState<boolean>(false);
  const {
    requestMicrophoneAccess,
    listening,
    transcript,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  React.useEffect(() => {
    hideToolBar();
    requestMicrophoneAccess();
  }, []);

  React.useEffect(() => {
    if (loader) {
      setTimeout(() => {
        setLoader(false);
        setAiInvoke(true);
      }, 1000);
    }
  }, [loader]);

  // a temp fix for the audio playing state
  React.useEffect(() => {
    if (audioElmRef.current) {
      audioElmRef.current.onended = () => {
        setAudioPlaying(false);
      };
    }

    if (!audioPlaying) {
      setAmplitude(0);
    } else {
      setAmplitude(4);
    }
  }, [audioPlaying]);

  React.useEffect(() => {
    console.log({ transcript });
  }, [transcript, listening]);

  function startRecording() {
    if (audioPlaying) {
      audioElmRef.current?.pause();
      setAudioPlaying(false);
    }
    console.log("hey");
    setSpeaking(true);
    startListening();
    // SpeechRecognition.startListening();
  }
  function stopRecording() {
    setSpeaking(false);
    stopListening();
  }

  return (
    <FlexColStart className="relative w-full h-full min-h-screen">
      <FlexColStart className="w-full px-4 py-4">
        <Link href="/dashboard/home">
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </Link>
      </FlexColStart>

      {/* Voice assist container */}
      <FlexColStartCenter className="w-full h-full">
        {loader && <WaveLoader />}

        <div className={cn(aiInvoke ? "visible" : "invisible")}>
          <ReactSiriwave theme="ios9" amplitude={amplitude} frequency={2} />
        </div>

        <audio
          ref={audioElmRef}
          src={"/audio/response/greetings/welcome.mp3"}
          controls
          className="invisible"
        />
        {!loader && !aiInvoke && (
          <button
            className="px-8 py-2 rounded-md glowyBtn scale-[.80] hover:scale-[.95] border-purple-100 border-b-[5px] active:border-b-[2px] transition-all text-1xl font-ppReg"
            onClick={() => {
              setLoader(true);
              setTimeout(() => {
                audioElmRef?.current?.play();
                setAudioPlaying(true);
              }, 1000);
            }}
          >
            Initialize AI
          </button>
        )}
      </FlexColStartCenter>
      <FlexColCenter className="w-full fixed bottom-5">
        {/* subtitles here */}
        <FlexRowCenter className="w-full transition-all flex-wrap">
          {humanSpeechs.map((speech) => (
            <span
              key={speech}
              className="p-2 m-1 rounded-md bg-dark-100 text-xs text-white-100"
            >
              {speech}
            </span>
          ))}
        </FlexRowCenter>
        <br />
        {aiInvoke && (
          <button
            className="p-5 rounded-full text-4xl glowyBtn transition-all scale-[.80] hover:scale-[.95] border-purple-100 border-b-[6px] active:border-b-[2px] "
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
          >
            {speaking ? <Pause size={30} /> : <Mic size={30} />}
          </button>
        )}
      </FlexColCenter>

      <BlurBgRadial className="w-[70%] absolute opacity-1 top-[-50%] left-5 bg-white-300 blur-[450px] " />
    </FlexColStart>
  );
}
