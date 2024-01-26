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
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import { googleTTS, handleUserRequest } from "@/http/request";
import {
  audioBase64ToBlob,
  cn,
  handleBlobToBase64,
  retrieveAudioByAction,
} from "@/lib/utils";
import { HashmindAIResponseAction, ResponseData } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Mic, MoveLeft, Pause } from "lucide-react";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

export default function AI() {
  const { hideToolBar } = useDataContext();
  const [humanSpeechs, setHumanSpeechs] = React.useState<string[]>([]);
  const [audioPlaying, setAudioPlaying] = React.useState<boolean>(false);
  const [amplitude, setAmplitude] = React.useState<number>(0);
  const [audioUrl, setAudioUrl] = React.useState(
    "/audio/response/greetings/welcome.mp3"
  );
  const [speaking, setSpeaking] = React.useState<boolean>(false);
  const audioElmRef = React.useRef<HTMLAudioElement>(null);
  const [loader, setLoader] = React.useState<boolean>(false);
  const [aiInvoke, setAiInvoke] = React.useState<boolean>(false);
  const [base64Data, setBase64Data] = React.useState<string | unknown | null>(
    null
  );
  const handleUserRequestMut = useMutation({
    mutationFn: async (data: any) => await handleUserRequest(data),
  });
  const handleTTSMut = useMutation({
    mutationFn: async (data: any) => await googleTTS(data),
  });

  const { requestMicrophoneAccess, startListening, stopListening } =
    useSpeechRecognition();

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
    if (handleUserRequestMut?.error) {
      const data = (handleUserRequestMut?.error as any)?.response
        ?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (handleUserRequestMut.data) {
      // toast.success("Updated.");
      const data = handleUserRequestMut.data as ResponseData;
      const response = data?.data as any;

      if (response?.aiMsg) {
        // convert the aiMsg to audio
        // ! Uncomment this back to enable TTS
        // handleTTSMut.mutate({ text: response?.aiMsg });
      } else {
        // get the action code
        const actionCode = response?.action as HashmindAIResponseAction;
        if (actionCode === "ARTICLE_CREATION_QUEUED") {
          // get the audio for this code.
          const audioUrl = retrieveAudioByAction(actionCode);
          if (audioUrl) playAudio(audioUrl);
          else toast.success("Article creation queued.");
        }
      }
    }
  }, [
    handleUserRequestMut.data,
    handleUserRequestMut.error,
    handleUserRequestMut.isPending,
  ]);

  React.useEffect(() => {
    if (handleTTSMut?.error) {
      const data = (handleTTSMut?.error as any)?.response?.data as ResponseData;
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (handleTTSMut.data) {
      // toast.success("Updated.");
      const data = handleTTSMut.data as ResponseData;
      const audioContent = data.data?.content;
      const blobUrl = audioBase64ToBlob(audioContent);
      playAudio(blobUrl);
    }
  }, [handleTTSMut.data, handleTTSMut.error, handleTTSMut.isPending]);

  function startRecording() {
    if (audioPlaying) {
      audioElmRef.current?.pause();
      setAudioPlaying(false);
    }
    setSpeaking(true);
    startListening();
  }

  function stopRecording() {
    setSpeaking(false);
    stopListening(async ({ blob, blobUrl }) => {
      if (!blob) {
        toast.error(`Error recording`);
        return;
      }
      // console.log(blobUrl);

      const base64 = await handleBlobToBase64(blob);
      setBase64Data(base64);

      // send the audio to the server for processing to text
      handleUserRequestMut.mutate({
        audio_base64: base64,
      });
    });
  }

  function playAudio(url: string) {
    const audio = new Audio();
    audio.src = url;
    audio.play();

    // stop audio if one is being played
    if (audioPlaying || audio.currentTime > 0) {
      audioElmRef.current?.pause();
      audio.pause();
      audio.currentTime = 0;
      setAudioPlaying(false);
      setAmplitude(0);
    }

    audio.onended = () => {
      setAudioPlaying(false);
      setAmplitude(0);
    };

    setAudioPlaying(true);
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
          <ReactSiriwave
            theme={
              handleUserRequestMut.isPending || handleTTSMut.isPending
                ? "ios"
                : "ios9"
            }
            amplitude={
              handleUserRequestMut.isPending || handleTTSMut.isPending
                ? 1
                : amplitude
            }
            frequency={2}
          />
        </div>

        <audio
          ref={audioElmRef}
          src={audioUrl}
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
          <>
            <button
              className={cn(
                "p-5 rounded-full text-4xl glowyBtn transition-all scale-[.80] hover:scale-[.95] border-purple-100 disabled:cursor-not-allowed disabled:opacity-[.6] ",
                speaking
                  ? " border-t-[6px] active:border-t-[6px]"
                  : " border-b-[6px] active:border-b-[2px]"
              )}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={
                handleUserRequestMut.isPending || handleTTSMut.isPending
              }
            >
              {speaking ? <Pause size={30} /> : <Mic size={30} />}
            </button>
            <span className="text-xs text-white-100/70 font-ppSB scale-[.75] ">
              click and hold
            </span>
          </>
        )}
      </FlexColCenter>

      <BlurBgRadial className="w-[70%] absolute opacity-1 top-[-50%] left-5 bg-white-300 blur-[450px] " />
    </FlexColStart>
  );
}
