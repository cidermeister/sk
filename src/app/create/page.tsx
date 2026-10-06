"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mic, Square, Upload, Loader2, Image as ImageIcon } from "lucide-react";

export default function CreateTribute() {
  const { status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [passingDate, setPassingDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const showPhotos = process.env.NEXT_PUBLIC_SHOW_PHOTOS === "true";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return <div className="p-8 text-center">Loading...</div>;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);

      // Limit to 2 minutes (120 seconds)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 119) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const uploadFile = async (file: Blob | File, type: "audio" | "photo") => {
    const filename = type === "audio" ? `tribute-audio-${Date.now()}.webm` : `tribute-photo-${Date.now()}-${(file as File).name}`;
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
      method: "POST",
      body: file,
    });
    if (!response.ok) throw new Error(`Failed to upload ${type}`);
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate || !passingDate) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      let audioUrl = null;
      let photoUrl = null;

      if (audioBlob) {
        audioUrl = await uploadFile(audioBlob, "audio");
      }
      if (photo && showPhotos) {
        photoUrl = await uploadFile(photo, "photo");
      }

      const response = await fetch("/api/tribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, birthDate, passingDate, audioUrl, photoUrl }),
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        throw new Error("Failed to create tribute");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 mt-8 bg-space-800/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-aurora to-aurora-purple">
        Add a Star to the Galaxy
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-space-900 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aurora/50 transition-all"
            placeholder="Their name"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-space-900 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aurora/50 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Passing Date</label>
            <input
              type="date"
              required
              value={passingDate}
              onChange={(e) => setPassingDate(e.target.value)}
              className="w-full bg-space-900 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-aurora/50 [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="p-4 border border-white/10 rounded-lg bg-space-900/50">
          <label className="block text-sm font-medium text-gray-300 mb-4">Voice Memory (Max 2 mins)</label>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-full transition-colors border border-red-500/50"
                >
                  <Mic className="w-5 h-5" /> Start Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-full transition-colors animate-pulse"
                >
                  <Square className="w-5 h-5 fill-current" /> Stop ({formatTime(recordingTime)})
                </button>
              )}
            </div>
            {audioBlob && !isRecording && (
              <audio src={URL.createObjectURL(audioBlob)} controls className="h-10 w-full max-w-xs" />
            )}
          </div>
        </div>

        {showPhotos && (
          <div className="p-4 border border-white/10 rounded-lg bg-space-900/50">
            <label className="block text-sm font-medium text-gray-300 mb-4">Photo Memory (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-aurora/50 hover:bg-space-800/50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />
              </label>
            </div>
            {photo && (
              <p className="mt-2 text-sm text-aurora text-center">Selected: {photo.name}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-aurora to-aurora-purple hover:opacity-90 text-space-900 font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          {isSubmitting ? "Creating Star..." : "Add to Galaxy"}
        </button>
      </form>
    </div>
  );
}
