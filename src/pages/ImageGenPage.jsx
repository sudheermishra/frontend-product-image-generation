import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getImageGenerateUrl,
  getLeonardoImageUrl,
  downloadImage,
  parseImageResponse,
  revokeBlobUrl,
} from "../lib/utils";
import { OptionSelect } from "../ui/OptionSelect";

const LEONARDO_MODELS = [
  {
    value: "b2614463-296c-462a-9586-aafdb8f00e36",
    label: "FLUX Dev",
    description: "High-quality FLUX model",
    meta: "Recommended",
  },
  {
    value: "1dd50843-d653-4516-a8e3-f0238ee453ff",
    label: "FLUX Schnell",
    description: "Faster version of FLUX",
  },
  {
    value: "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3",
    label: "Leonardo Phoenix 1.0",
    description: "Leonardo's flagship model",
  },
  {
    value: "6b645e3a-d64f-4341-a6d8-7a3690fbf042",
    label: "Leonardo Phoenix 0.9",
    description: "Previous Phoenix version",
  },
  {
    value: "ideogram-v3.0",
    label: "Ideogram 3.0",
    description: "Text-focused model (uses v2 API)",
  },
  {
    value: "5c232a9e-906d-4777-953b-fca03f16687f",
    label: "Leonardo Vision XL",
    description: "High-quality XL model",
  },
  {
    value: "1e60896f-3c26-4296-a40d-05e548209183",
    label: "Leonardo Diffusion XL",
    description: "Versatile XL model",
  },
  {
    value: "2067ae23-35e5-4812-9022-f9739d507399",
    label: "AlbedoBase XL",
    description: "Specialized for high detail",
  },
];

const LEONARDO_STYLES = [
  { value: "debdf72a-91a4-467b-bf61-cc02bdeb69c6", label: "3D Render" },
  { value: "3cbb655a-7ca4-463f-b697-8a03ad67327c", label: "Acrylic" },
  { value: "b2a54a51-230b-4d4f-ad4e-8409bf58645f", label: "Anime General" },
  { value: "6fedbf1f-4a17-45ec-84fb-92fe524a29ef", label: "Creative" },
  {
    value: "111dc692-d470-4eec-b791-3475abac4c46",
    label: "Dynamic",
    meta: "Default in example",
  },
  { value: "594c4a08-a522-4e0e-b7ff-e4dac4b6b622", label: "Fashion" },
  { value: "09d2b5b5-d7c5-4c02-905d-9f84051640f4", label: "Game Concept" },
  { value: "7d7c2bc5-4b12-4ac3-81a9-630057e9e89f", label: "Graphic Design 3D" },
  { value: "645e4195-f63d-4715-a3f2-3fb1e6eb8c70", label: "Illustration" },
  { value: "556c1ee5-ec38-42e8-955a-1e82dad0ffa1", label: "None" },
  { value: "8e2bc543-6ee2-45f9-bcd9-594b6ce84dcd", label: "Portrait" },
  {
    value: "4edb03c9-8a26-4041-9d01-f85b5d4abd71",
    label: "Portrait Cinematic",
  },
  { value: "b504f83c-3326-4947-82e1-7fe9e839ec0f", label: "Ray Traced" },
  { value: "5bdc3f2a-1be6-4d1c-8e77-992a30824a2c", label: "Stock Photo" },
  { value: "1db308ce-c7ad-4d10-96fd-592fa6b75cc4", label: "Watercolor" },
];

const LEONARDO_DEFAULTS = {
  contrast: 3.5,
  numImages: 4,
  width: 1024,
  height: 1024,
};

function ImageGenPage() {
  const [mode, setMode] = useState("basic"); // "basic" | "leonardo"

  // Basic image generation
  const [productUrl, setProductUrl] = useState("");
  const [sampleImage, setSampleImage] = useState(null);
  const [samplePreviewUrl, setSamplePreviewUrl] = useState(null);

  // Shared output
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Leonardo form
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState(LEONARDO_MODELS[0].value);
  const [styleUUID, setStyleUUID] = useState(LEONARDO_STYLES[4].value);
  const [contrast, setContrast] = useState(LEONARDO_DEFAULTS.contrast);
  const [numImages, setNumImages] = useState(LEONARDO_DEFAULTS.numImages);
  const [width, setWidth] = useState(LEONARDO_DEFAULTS.width);
  const [height, setHeight] = useState(LEONARDO_DEFAULTS.height);
  const [enhancePrompt, setEnhancePrompt] = useState(false);

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
      const item = [...(e.clipboardData?.items ?? [])].find((i) =>
        i.type.startsWith("image/"),
      );
      if (!item) return;
      e.preventDefault();
      const blob = item.getAsFile();
      if (!blob) return;
      const file = new File([blob], "pasted-image.png", { type: blob.type });
      setSampleImage(file);
      setMode("basic");
    }
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  async function handleBasicSubmit(e) {
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

  async function handleLeonardoSubmit(e) {
    e.preventDefault();
    setError(null);
    setGeneratedImage((prev) => {
      revokeBlobUrl(prev);
      return null;
    });

    if (!apiKey.trim()) {
      setError("Add your Leonardo API key.");
      return;
    }
    if (!productUrl.trim() && !sampleImage) {
      setError("Provide a product URL and/or upload a sample image.");
      return;
    }

    const formData = new FormData();
    formData.append("apiKey", apiKey.trim());
    if (productUrl.trim()) formData.append("productUrl", productUrl.trim());
    if (sampleImage) formData.append("sampleImage", sampleImage);
    formData.append("modelId", modelId);
    formData.append("contrast", String(contrast));
    formData.append("num_images", String(numImages));
    formData.append("width", String(width));
    formData.append("height", String(height));
    formData.append("styleUUID", styleUUID);
    formData.append("enhancePrompt", String(enhancePrompt));

    setLoading(true);
    try {
      const res = await fetch(getLeonardoImageUrl(), {
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
      setError(err.message || "Failed to generate image with Leonardo");
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight mb-1">
          Generate Product Images
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Choose a generation method, customise the inputs, and preview the
          result.
        </p>

        <div className="mb-6 inline-flex rounded-lg border border-slate-700 bg-slate-800/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => setMode("basic")}
            className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors ${
              mode === "basic"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-300 hover:bg-slate-700/70"
            }`}
          >
            Basic image generation
          </button>
          <button
            type="button"
            onClick={() => setMode("leonardo")}
            className={`flex-1 rounded-md px-3 py-2 font-medium transition-colors ${
              mode === "leonardo"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-300 hover:bg-slate-700/70"
            }`}
          >
            Leonardo AI
          </button>
        </div>

        {mode === "basic" ? (
          <form onSubmit={handleBasicSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="productUrl"
                className="text-sm font-medium text-slate-300"
              >
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
              <label
                htmlFor="sampleImage"
                className="text-sm font-medium text-slate-300"
              >
                Sample Image
              </label>
              <p className="text-slate-500 text-xs">
                Choose a file or paste an image with Ctrl+V (Windows/Linux) or
                Cmd+V (Mac).
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
                    {sampleImage.name === "pasted-image.png"
                      ? "Pasted image"
                      : sampleImage.name}
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
              {loading && mode === "basic" ? "Generating…" : "Generate Images"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLeonardoSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="leonardoApiKey"
                className="text-sm font-medium text-slate-300"
              >
                Leonardo API key
              </label>
              <input
                type="password"
                id="leonardoApiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="LEONARDO_API_KEY"
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="leonardoProductUrl"
                className="text-sm font-medium text-slate-300"
              >
                Product URL
              </label>
              <input
                type="url"
                id="leonardoProductUrl"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://amazon.com/product/..."
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="leonardoSampleImage"
                className="text-sm font-medium text-slate-300"
              >
                Sample image
              </label>
              <p className="text-slate-500 text-xs">
                Optional reference image sent to your backend alongside the
                Leonardo payload.
              </p>
              <input
                type="file"
                id="leonardoSampleImage"
                name="leonardoSampleImage"
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
                    {sampleImage.name === "pasted-image.png"
                      ? "Pasted image"
                      : sampleImage.name}
                  </span>
                </div>
              )}
            </div>

            <OptionSelect
              id="leonardoModel"
              label="Model"
              helper="Choose one of the available Leonardo models."
              value={modelId}
              onChange={setModelId}
              options={LEONARDO_MODELS}
            />

            <OptionSelect
              id="leonardoStyle"
              label="Style"
              helper="Optional preset style to influence the final look."
              value={styleUUID}
              onChange={setStyleUUID}
              options={LEONARDO_STYLES}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contrast"
                  className="text-sm font-medium text-slate-300"
                >
                  Contrast
                </label>
                <input
                  id="contrast"
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  value={contrast}
                  onChange={(e) => setContrast(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="numImages"
                  className="text-sm font-medium text-slate-300"
                >
                  Number of images
                </label>
                <input
                  id="numImages"
                  type="number"
                  min={1}
                  max={4}
                  value={numImages}
                  onChange={(e) => setNumImages(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="width"
                  className="text-sm font-medium text-slate-300"
                >
                  Width
                </label>
                <input
                  id="width"
                  type="number"
                  min={256}
                  max={1536}
                  step={8}
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="height"
                  className="text-sm font-medium text-slate-300"
                >
                  Height
                </label>
                <input
                  id="height"
                  type="number"
                  min={256}
                  max={1536}
                  step={8}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 focus:border-transparent"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={enhancePrompt}
                onChange={(e) => setEnhancePrompt(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-slate-100 focus:ring-slate-500"
              />
              Enhance prompt
              <span className="text-xs text-slate-500">
                (let Leonardo refine your prompt)
              </span>
            </label>

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
              {loading && mode === "leonardo"
                ? "Generating with Leonardo…"
                : "Generate with Leonardo"}
            </button>
          </form>
        )}

        {generatedImage && (
          <div className="mt-8 rounded-lg border border-slate-600 bg-slate-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">
                {mode === "leonardo" ? "Leonardo image" : "Generated image"}
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadImage(generatedImage, "generated-image.png")
                }
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
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
