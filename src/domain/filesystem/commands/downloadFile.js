import { readFile } from "@/domain/filesystem";
import path from "path";

/**
 * Reads a file and initiates its download in the browser.
 * @param {string} filepath - The path to the file.
 */
export const downloadFileFromPath = async (filepath) => {
  try {
    // Read the file using the readFile function
    const fileBuffer = await readFile(filepath);

    // Convert the Buffer to a Blob
    const fileBlob = new Blob([fileBuffer], {
      type: "application/octet-stream",
    });

    // Extract the filename from the filepath
    const filename = path.basename(filepath);

    // Use the download function
    downloadFileInBrowser(fileBlob, filename);
  } catch (error) {
    console.error(`Failed to download file from ${filepath}:`, error);
  }
};

/**
 * Initiates a download of a file in the browser.
 * @param {Blob} fileBlob - The file data as a Blob.
 * @param {string} filename - The desired name of the downloaded file.
 */
export const downloadFileInBrowser = (fileBlob, filename) => {
  try {
    // Create a URL for the Blob
    const url = URL.createObjectURL(fileBlob);

    // Create an anchor element and set its href to the Blob URL
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    // Append the anchor to the body
    document.body.appendChild(a);

    // Programmatically click the anchor to trigger the download
    a.click();

    // Remove the anchor from the document
    document.body.removeChild(a);

    // Revoke the Blob URL to free up resources
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Failed to download ${filename}:`, error);
  }
};
