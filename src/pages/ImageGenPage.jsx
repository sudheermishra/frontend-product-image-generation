import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getImageGenerateUrl,
  downloadImage,
  parseImageResponse,
  revokeBlobUrl,
} from "../lib/utils";

function ImageGenPage() {
  const [productUrl, setProductUrl] = useState("");
  const [sampleImage, setSampleImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [samplePreviewUrl, setSamplePreviewUrl] = useState(null);

  useEffect(() => {
    if (!sampleImage) {
      setSamplePreviewUrl((prev) => {
        revokeBlobUrl(prev);
        return null;
      });
      return;
    }
    const url = URL.createObjectURL(sampleImage);
    setSamplePreviewUrl(url);
    return () => revokeBlobUrl(url);
  }, [sampleImage]);

  useEffect(() => {
    return () => revokeBlobUrl(generatedImage);
  }, [generatedImage]);

  useEffect(() => {
    function handlePaste(e) {
      const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith("image/"));
      if (!item) return;
      e.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return;
      const file = new File([blob], "pasted-image.png", { type: blob.type });
      setSampleImage(file);
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setGeneratedImage((prev) => {
      revokeBlobUrl(prev);
      return null;
    });

    const formData = new FormData();
    if (productUrl.trim()) formData.append("productUrl", productUrl.trim());
    if (sampleImage) formData.append("sampleImage", sampleImage);

    if (!productUrl.trim() && !sampleImage) {
      setError("Please provide a product URL and/or upload a sample image.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(getImageGenerateUrl(), {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed (${res.status})`);
      }

      const imageSrc = await parseImageResponse(res);
      setGeneratedImage((prev) => {
        revokeBlobUrl(prev);
        return imageSrc;
      });
    } catch (err) {
      setError(err.message || "Failed to generate image");
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
          Generate Product Images
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          Upload or paste a product image, or add a reference URL to generate
          studio-quality visuals.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="productUrl" className="text-sm font-medium text-slate-300">
              Product URL
            </label>
            <input
              type="url"
              id="productUrl"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://amazon.com/product/..."
              className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="sampleImage" className="text-sm font-medium text-slate-300">
              Sample Image
            </label>
            <p className="text-slate-500 text-xs">
              Choose a file or paste an image with Ctrl+V (Windows/Linux) or Cmd+V (Mac).
            </p>
            <input
              type="file"
              id="sampleImage"
              name="sampleImage"
              accept="image/*"
              onChange={(e) => setSampleImage(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 file:cursor-pointer hover:file:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
            {sampleImage && samplePreviewUrl && (
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800/30 px-3 py-2">
                <img
                  src={samplePreviewUrl}
                  alt="Sample"
                  className="h-14 w-14 rounded object-cover"
                />
                <span className="text-sm text-slate-400">
                  {sampleImage.name === "pasted-image.png" ? "Pasted image" : sampleImage.name}
                </span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 cursor-pointer rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Generating…" : "Generate Images"}
          </button>
        </form>

        {generatedImage && (
          <div className="mt-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">Generated image</p>
              <button
                type="button"
                onClick={() => downloadImage(generatedImage, "generated-image.png")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download
              </button>
            </div>
            <img
              src={generatedImage}
              alt="Generated product"
              className="w-full rounded-lg border border-slate-600 object-contain max-h-[70vh]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageGenPage;
