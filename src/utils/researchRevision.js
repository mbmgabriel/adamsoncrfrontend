export const getLatestDocument = (documents = [], typeId) => documents
  .filter((document) => Number(document.document_title_id) === Number(typeId) && document.document_filepath)
  .reduce((latest, document) => !latest || Number(document.id || 0) > Number(latest.id || 0) ? document : latest, null);

export const getDocumentUrl = (path, baseUrl) => {
  if (!path) return "";
  try {
    const url = new URL(path, `${baseUrl.replace(/\/$/, "")}/`);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
};

export const getDocumentName = (path) => {
  if (!path) return "Uploaded document";
  try {
    return decodeURIComponent(new URL(path, "http://local.invalid").pathname.split("/").pop())
      .replace(/^document_filepath-\d+-/, "");
  } catch { return "Uploaded document"; }
};
