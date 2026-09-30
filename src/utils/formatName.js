const EMPTY_NAME_PARTS = new Set(["null", "undefined"]);

export const formatDisplayName = (...values) =>
  values
    .flatMap((value) => String(value ?? "").trim().split(/\s+/))
    .filter(
      (part) => part && !EMPTY_NAME_PARTS.has(part.toLowerCase())
    )
    .join(" ");
