
function buildApiUrl(pathEnv, defaultPath) {
  const base = import.meta.env.VITE_API_BASE_URL ?? "";
  const path = pathEnv ?? defaultPath;
  const baseNorm = base.replace(/\/$/, "");
  const pathNorm = path.startsWith("/") ? path : `/${path}`;
  return baseNorm ? `${baseNorm}${pathNorm}` : pathNorm;
}

export function getImageGenerateUrl() {
  return buildApiUrl(
    import.meta.env.VITE_IMAGE_GENERATE_PATH,
    "/api/images/generate"
  );
}

export function getVideoGenerateUrl() {
  return buildApiUrl(
    import.meta.env.VITE_VIDEO_GENERATE_PATH,
    "/api/videos/generate"
  );
}

export function getLeonardoImageUrl() {
  return buildApiUrl(
    import.meta.env.VITE_LEONARDO_IMAGE_PATH,
    "/api/images/leonardo"
  );
}


export function downloadFile(src, filename) {
  if (!src || !filename) return;
  const a = document.createElement("a");
  a.href = src;
  a.download = filename;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function downloadImage(imageSrc, filename = "generated-image.png") {
  downloadFile(imageSrc, filename);
}

export function downloadVideo(videoSrc, filename = "generated-video.mp4") {
  downloadFile(videoSrc, filename);
}


export async function parseImageResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("image/")) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  if (contentType.includes("application/json")) {
    const json = await response.json();
    const base64 =
      json.image ?? json.data ?? json.base64 ?? (typeof json === "string" ? json : "");
    if (!base64) throw new Error("No image data in response");
    return `data:image/png;base64,${base64}`;
  }

  const base64 = await response.text();
  if (!base64) throw new Error("No image data in response");
  return `data:image/png;base64,${base64}`;
}

/**
 * Parse video generation API response into a playable video source (blob or data URL).
 * @param {Response} response - fetch Response
 * @returns {Promise<string>} - video src for <video>
 */
export async function parseVideoResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("video/")) {
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  if (contentType.includes("application/json")) {
    const json = await response.json();
    const base64 =
      json.video ?? json.data ?? json.base64 ?? (typeof json === "string" ? json : "");
    const url = json.url ?? json.videoUrl;
    if (url) return url;
    if (!base64) throw new Error("No video data in response");
    const mime = json.mimeType ?? "video/mp4";
    return `data:${mime};base64,${base64}`;
  }

  const base64 = await response.text();
  if (!base64) throw new Error("No video data in response");
  return `data:video/mp4;base64,${base64}`;
}

export function isBlobUrl(url) {
  return typeof url === "string" && url.startsWith("blob:");
}


export function revokeBlobUrl(url) {
  if (isBlobUrl(url)) URL.revokeObjectURL(url);
}
