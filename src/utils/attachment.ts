const backendOrigin =
  import.meta.env.VITE_BACKEND_ORIGIN?.replace(/\/$/, "") ?? "";

export const getAttachmentName = (url: string, fallbackId: number): string => {
  const rawName = url.split("/").pop();
  return rawName ? decodeURIComponent(rawName) : `attachment-${fallbackId}`;
};

export const getAttachmentExtension = (url: string): string => {
  const sanitizedUrl = url.split("?")[0].split("#")[0];
  const extension = sanitizedUrl.split(".").pop();
  return extension?.toLowerCase() ?? "";
};

export const getAttachmentType = (
  url: string,
): "image" | "pdf" | "doc" | "sheet" | "slide" | "file" => {
  const ext = getAttachmentExtension(url);

  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["ppt", "pptx"].includes(ext)) return "slide";

  return "file";
};

export const getAttachmentUrl = (url: string): string => {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (backendOrigin && url.startsWith("/")) {
    return `${backendOrigin}${url}`;
  }

  return url;
};

export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "-";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (bytes >= 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${bytes} B`;
};

export const resolveAttachmentSize = async (url: string): Promise<string> => {
  try {
    const headResponse = await fetch(url, { method: "HEAD" });
    if (headResponse.ok) {
      const contentLengthHeader = headResponse.headers.get("content-length");
      const contentLength = contentLengthHeader ? Number(contentLengthHeader) : NaN;
      if (!Number.isNaN(contentLength)) {
        return formatFileSize(contentLength);
      }
    }

    const getResponse = await fetch(url);
    if (!getResponse.ok) {
      return "-";
    }

    const fileBlob = await getResponse.blob();
    return formatFileSize(fileBlob.size);
  } catch {
    return "-";
  }
};
