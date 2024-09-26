/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-26 15:15:58
 */
// Prompt.js
import React from "react";
import { useChatStore } from "@/store";
import ArIcon from "@/components/arIcon";

const AiConfirm = () => {
  const { showPrompt, hidePromptMessage, handleAccept, handleReject } =
    useChatStore();

  if (!showPrompt) {
    return null;
  }

  const executeHandleAccept = () => {
    // 处理 Keep 操作
    handleAccept && handleAccept();
    hidePromptMessage();
  };

  const executeHandleDiscard = () => {
    // 处理 Discard 操作
    handleReject && handleReject();
    hidePromptMessage();
  };

  const handleCancel = () => {
    hidePromptMessage();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-[99999] prompt-container">
      <div className="relative p-6 bg-white rounded-lg shadow-lg w-80">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-md overflow-hidden">
              <ArIcon name={"Magic"} className="text-[#41DE07] w-full h-full" />
            </div>
          </div>
          <div className="font-bold text-lg">
            Do you want to accept or discard pending AI edits?
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <button
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={executeHandleAccept}
          >
            Accept
          </button>
          <button
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700  hover:bg-gray-200"
            onClick={executeHandleDiscard}
          >
            Discard
          </button>
          <button
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiConfirm;
