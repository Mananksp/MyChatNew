import { useChatStore } from "../store/useChatStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { useEffect, useRef, useState } from "react";
import { formatMessageTime } from "../lib/utils.js";
import { X } from "lucide-react";

const ChatbotContainer = ({ onBack }) => {
  const {
    chatbotMessages,
    sendChatbotMessage,
    isChatbotLoading,
    setChatbotActive,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatbotMessages.length]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isChatbotLoading) return;

    await sendChatbotMessage(inputText.trim());
    setInputText("");
  };

  const handleClose = () => {
    setChatbotActive(false);
    if (onBack) onBack();
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="border-b border-base-300 p-3 sm:p-4 md:p-5 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-xl">✨</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-base sm:text-lg truncate">
              Grok Assistant
            </h2>
            <p className="text-xs sm:text-sm text-base-content/60">AI Chat</p>
          </div>
        </div>

        {/* Back/Close Button - Mobile */}
        <button
          onClick={handleClose}
          className="btn btn-sm btn-circle btn-ghost md:hidden flex-shrink-0"
          title="Back"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
        {chatbotMessages.map((message) => {
          const isBotMessage = message.senderId === "chatbot";
          return (
            <div
              key={message._id}
              className={`flex ${isBotMessage ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                  isBotMessage
                    ? "bg-base-200 text-base-content"
                    : "bg-blue-600 text-white"
                }`}
              >
                <p className="text-sm sm:text-base break-words leading-relaxed">
                  {message.text}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}

        {isChatbotLoading && (
          <div className="flex justify-start">
            <div className="bg-base-200 px-4 py-3 rounded-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce"
                  style={{ animationDelay: "100ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-base-content/50 rounded-full animate-bounce"
                  style={{ animationDelay: "200ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-base-300 p-3 sm:p-4 md:p-5 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message assistant..."
            disabled={isChatbotLoading || !authUser}
            className="input input-bordered flex-1 input-sm sm:input-md text-sm sm:text-base"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isChatbotLoading || !authUser}
            className="btn btn-blue-600 btn-sm sm:btn-md gap-1 sm:gap-2 flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            <span>Send</span>
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatbotContainer;
