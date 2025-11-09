export interface UrlValidationResult {
  ok: boolean;
  value?: string;
  error?: string;
}

const MAX_TOTAL_LENGTH = 2000; // max length of URL

export function validateAndNormalizeUrl(input: unknown): UrlValidationResult {
  // if input url is not string type then process will stop
  if (typeof input !== "string") return { ok: false, error: "not_string" };

  const raw = input.trim();
  if (!raw) return { ok: false, error: "empty" };

  if (raw.length > MAX_TOTAL_LENGTH) return { ok: false, error: "too_long" };

  // this makes protocol required explicitly.
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
    return { ok: false, error: "missing_protocol" };
  }

  // creating URL object outof raw link
  let urlObj: URL;
  try {
    urlObj = new URL(raw);
  } catch {
    return { ok: false, error: "invalid_structure" };
  }

  // url object must have either http or https as protocol
  const protocol = urlObj.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, error: "unsupported_protocol" };
  }

  // check if url object has hostname
  const host = urlObj.hostname;
  if (!host) return { ok: false, error: "empty_host" };

  // remove default ports
  if (
    (urlObj.port === "80" && protocol === "http:") ||
    (urlObj.port === "443" && protocol === "https:")
  ) {
    urlObj.port = "";
  }

  // remove trailing slash in path
  if (urlObj.pathname.endsWith("/") && urlObj.pathname !== "/") {
    urlObj.pathname = urlObj.pathname.replace(/\/+$/, "");
  }

  return { ok: true, value: urlObj.toString() };
}
