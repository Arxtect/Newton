/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-12 14:59:50
 */
import { toast } from "react-toastify";

export const useCopyToClipboard = () => {
  const copyToClipboard = async (link, message) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = link;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      message && toast.success(message);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return [copyToClipboard];
};

