"use client";
import BlurBgRadial from "@/components/blurBgRadial";
import {
  FlexColCenter,
  FlexColStart,
  FlexColStartCenter,
  FlexRowCenter,
  FlexRowCenterBtw,
} from "@/components/flex";
import WaveLoader from "@/components/loader";
import Button from "@/components/ui/button";
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
import { useRouter } from "next/navigation";
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
  const [delArt, setDelArt] = React.useState<boolean>(false);
  const [delArtModal, setDelArtModal] = React.useState<boolean>(false);
  const [timer, setTimer] = React.useState<number>(0);
  const router = useRouter();
  const handleUserRequestMut = useMutation({
    mutationFn: async (data: { audio_base64?: string; usersIntent?: string }) =>
      await handleUserRequest(data),
  });
  const handleTTSMut = useMutation({
    mutationFn: async (data: any) => await googleTTS(data),
  });

  const { requestMicrophoneAccess, startListening, stopListening } =
    useSpeechRecognition();

  const audio = audioElmRef.current!;

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
      const errData = data?.data as any;

      if (errData?.action === "ARTICLE_TITLE_NOT_PROVIDED") {
        const audioUrl = retrieveAudioByAction(errData?.action);
        if (audioUrl) playAudio(audioUrl);
        else toast.error("Please provide a title for the article.");
        return;
      }
      toast.error(data?.message ?? "Something went wrong!.");
    }
    if (handleUserRequestMut.data) {
      // toast.success("Updated.");
      const data = handleUserRequestMut.data as ResponseData;
      const response = data?.data as any;

      console.log({ response });

      if (response?.aiMsg) {
        // convert the aiMsg to audio
        // ! Uncomment this back to enable TTS
        handleTTSMut.mutate({ text: response?.aiMsg });
      } else {
        // get the action code
        const actionCode = response?.action as HashmindAIResponseAction;
        if (
          ["ARTICLE_CREATION_QUEUED", "ARTICLE_DELETION_QUEUED"].includes(
            actionCode
          )
        ) {
          if (delArt || delArtModal) {
            setDelArt(false);
            setDelArtModal(false);
          }
          const audioUrl = retrieveAudioByAction(actionCode);
          if (audioUrl) playAudio(audioUrl);
          else toast.success("Processing in queue.");
        }
        if (actionCode === "DELETE_ARTICLE_REQUESTED") {
          setDelArt(true);
          const audioUrl = retrieveAudioByAction(actionCode);
          if (audioUrl) playAudio(audioUrl);
          else toast.success("About to delete an article, are you sure??");
        }
        if (actionCode === "ARTICLE_DELETING_TITLE_NOTFOUND") {
          setDelArt(false);
          setDelArtModal(false);
          const audioUrl = retrieveAudioByAction(actionCode);
          if (audioUrl) playAudio(audioUrl);
          else toast.success("No title provided.");
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

  if (audio) {
    audio.onended = () => {
      audio.currentTime = 0;
      setAudioPlaying(false);
      setDelArt(false);
      if (delArt) setDelArtModal(true);
    };
    // audio.addEventListener("error", (event) => {
    //   console.error("Audio error");
    // });
  }

  function audioStop() {
    audio.pause();
    audio.src = "";
    audio.currentTime = 0;
    setAudioPlaying(false);
  }

  function startRecording() {
    const now = Date.now();
    setTimer(now);
    audioStop();
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

      const base64 = await handleBlobToBase64(blob);
      setBase64Data(base64);

      const after = Date.now();
      const diff = after - timer;
      if (diff < 1000) {
        toast.error("Please speak for at least 4 second.");
        setTimer(0);
        return;
      }

      handleUserRequestMut.mutate({
        audio_base64: base64 as string,
      });
    });
  }

  function playAudio(url: string) {
    audio.src = url;
    audio.play();

    // stop audio if one is being played
    if (audioPlaying || audio.currentTime > 0) {
      audioStop();
      setAmplitude(0);
    }

    setAudioPlaying(true);
  }

  return (
    <FlexColStart className="relative w-full h-full min-h-screen">
      <FlexColStart className="w-full px-4 py-4">
        <button
          // href="/dashboard/home"
          onClick={() => {
            audio.pause();
            audio.src = "";
            router.push("/dashboard/home");
          }}>
          <MoveLeft
            className="text-white-100 p-2 rounded-md bg-dark-100 "
            size={30}
          />
        </button>
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
                audio.load();
                audio.play();
                setAudioPlaying(true);
              }, 1000);
            }}>
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
              className="p-2 m-1 rounded-md bg-dark-100 text-xs text-white-100">
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
                delArt ||
                handleUserRequestMut.isPending ||
                handleTTSMut.isPending
              }>
              {speaking ? <Pause size={30} /> : <Mic size={30} />}
            </button>
            <span className="text-xs text-white-100/70 font-ppSB scale-[.75] ">
              click and hold
            </span>
          </>
        )}
      </FlexColCenter>

      {/* Modal */}
      <FlexColCenter
        className={cn(
          "w-full h-screen fixed top-0 backdrop-blur-lg bg-dark-105/20 bg-opacity-85 z-[999] transition-all",
          delArtModal ? "translate-y-[1]" : "translate-y-[50em]"
        )}>
        <FlexColStartCenter className="w-full max-w-[400px] mx-auto text-center">
          <p className="font-ppSB text-white-100 text-1xl text-center">
            Article Deletion
          </p>
          <p className="text-xs font-ppReg text-white-100/50">
            You've requested for an article to be deleted are you sure about
            this.?
          </p>
          <br />
          <br />
          <FlexRowCenterBtw>
            <Button
              onClick={() => {
                handleUserRequestMut.mutate({
                  audio_base64: "" as string,
                  usersIntent: "DELETE",
                });
              }}
              disabled={handleUserRequestMut.isPending}
              isLoading={handleUserRequestMut.isPending}
              className="cursor-pointer transition-all bg-blue-500 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] focus:bg-blue-101 font-ppReg">
              Yes
            </Button>

            <Button
              onClick={() => setDelArtModal(false)}
              disabled={handleUserRequestMut.isPending}
              className="cursor-pointer transition-all bg-red-305 text-white px-6 py-2 rounded-lg border-red-400 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] focus:bg-red-305 font-ppReg hover:bg-red-305">
              No
            </Button>
          </FlexRowCenterBtw>
        </FlexColStartCenter>
      </FlexColCenter>

      <BlurBgRadial className="w-[70%] absolute opacity-1 top-[-50%] left-5 bg-white-300 blur-[450px] " />
    </FlexColStart>
  );
}
