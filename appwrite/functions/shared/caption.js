const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]/g;

export function sanitizeCaption(caption = "") {
  return caption.replace(CONTROL_CHARS_REGEX, "").trim().slice(0, 2200);
}
