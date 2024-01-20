"use client";
import { FlexColStart } from "@/components/flex";
import Button from "@/components/ui/button";
import React from "react";
import toast from "react-hot-toast";

export default function GenAIResponses() {
  const [prompt, setPrompt] = React.useState<string>("");
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  const generateResponse = async () => {
    if (prompt.length < 1) return;
    const options = {
      method: "POST",
      headers: {
        "xi-api-key": "b4dd057279fa6f30a401f78b860f8ea8",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: prompt,
        voice_settings: {
          similarity_boost: 0,
          stability: 0,
        },
      }),
    };

    try {
      setLoading(true);
      const res = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/jsCqWAovK2LkecY7zXl4",
        options
      );
      const data = await res.arrayBuffer();
      setLoading(false);

      if (!res.ok) {
        toast.error("An error occured");
        return;
      }

      const blob = new Blob([data], { type: "audio/mp3" });
      const blobUrl = URL.createObjectURL(blob);
      audioRef.current!.src = blobUrl;
    } catch (e: any) {
      setLoading(false);
      console.log(e);
      toast.error("An error occured");
    }
  };

  return (
    <FlexColStart className="p-5">
      <h1>Gen AI Responses</h1>
      <p>Generate AI responses to a given prompt.</p>
      <br />
      <textarea
        className="text-dark-100"
        name=""
        id=""
        cols={50}
        rows={10}
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      ></textarea>
      <audio ref={audioRef} controls />
      <br />
      <Button onClick={generateResponse} isLoading={loading}>
        Generate
      </Button>
    </FlexColStart>
  );
}
