import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getVideoGenerateUrl,
  parseVideoResponse,
  downloadVideo,
  revokeBlobUrl,
} from "../lib/utils";

function VideoGenPage() {
  const [imageFile, setImageFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => revokeBlobUrl(generatedVideo);
  }, [generatedVideo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGeneratedVideo((prev) => {
      revokeBlobUrl(prev);
      return null;
    });

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    if (prompt.trim()) formData.append("prompt", prompt.trim());

    if (!imageFile && !prompt.trim()) {
      setError("Please upload an image and/or enter a scene description.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getVideoGenerateUrl(), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }

      const videoSrc = await parseVideoResponse(res);
      setGeneratedVideo(videoSrc);
    } catch (err) {
      setError(err.message || "Failed to generate video");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight mb-1">
          Generate Product Videos
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Upload a product image and describe your scene. AI will create a
          cinematic 10–30 second showcase video.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-600 bg-slate-800/40 p-5">
            <label htmlFor="image" className="block text-sm font-medium text-slate-300 mb-2">
              image <span className="font-normal text-slate-500">(file)</span>
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 file:cursor-pointer hover:file:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
            {imageFile && (
              <p className="mt-2 text-xs text-slate-500">{imageFile.name}</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-600 bg-slate-800/40 p-5">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
              prompt <span className="font-normal text-slate-500">(text)</span>
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="e.g. Product slowly rotating on a marble table, golden hour lighting..."
              className="w-full resize-y rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <span className="shrink-0 text-amber-400" aria-hidden>ℹ</span>
            <p className="text-sm text-slate-400 leading-relaxed">
              Video generation can take <strong className="font-semibold text-slate-300">2–5 minutes</strong>. Keep this tab
              open until the video is ready.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 rounded-lg cursor-pointer border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating…" : "▶ Generate Video"}
          </button>
        </form>

        {generatedVideo && (
          <div className="mt-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">Generated video</p>
              <button
                type="button"
                onClick={() => downloadVideo(generatedVideo, "generated-video.mp4")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            </div>
            <video
              src={generatedVideo}
              controls
              className="w-full rounded-lg border border-slate-600 max-h-[70vh]"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoGenPage;
