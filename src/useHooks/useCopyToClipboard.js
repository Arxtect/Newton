import { toast } from "react-toastify";

export const useCopyToClipboard = () => {
  const copyToClipboard = async (
    link,
    message,
    type = "success",
    modalElement
  ) => {
    try {
      console.log("Attempting to copy:",navigator.clipboard, link);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        console.log("Copied using modern API");
        if (message) {
          if (type === "info") {
            toast.info(message);
          } else {
            toast.success(message);
          }
        }
      } else {
        // Fallback for older browsers or environments without clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed"; // Avoid scrolling to bottom
        textArea.style.opacity = "0"; // Make the textarea invisible
        textArea.style.left = "-9999px"; // Move textarea out of view

        // Attach the textarea to the modalElement if provided, otherwise to the body
        const parentElement = modalElement || document.body;
        parentElement.appendChild(textArea);
        textArea.focus();
        textArea.select();

      
        const successful = document.execCommand("copy");
        if (!successful) {
          throw new Error("Fallback: Copy command was unsuccessful");
        }
        parentElement.removeChild(textArea);


        if (message) {
          if (type === "info") {
            toast.info(message);
          } else {
            toast.success(message);
          }
        }
      }
    } catch (err) {
      console.error("Copy to clipboard failed", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  return [copyToClipboard];
};
