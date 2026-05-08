import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Send } from "lucide-react";
import toast from "react-hot-toast";

const AssistantModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      _id: "intro",
      senderId: "chatbot",
      text: "Hi! I am Grok. Ask me anything — I run through your server so your API key stays private.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { askChatbot } = useChatStore();
  const { authUser } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    if (!authUser) {
      toast.error("Please login to use the assistant");
      return;
    }

    // Add user message
    const userMessage = {
      _id: `user-${Date.now()}`,
      senderId: authUser._id,
      text: inputText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    const response = await askChatbot(inputText);
    if (response?.text) {
      const botMessage = {
        _id: `bot-${Date.now()}`,
        senderId: "chatbot",
        text: response.text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } else {
      toast.error("Assistant request failed");
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-0">
      <div
        className="modal modal-open w-full sm:w-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-box max-w-4xl w-full max-h-[calc(100vh-4rem)] overflow-hidden bg-base-100 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-base-300 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                  <span className="text-lg sm:text-xl">✨</span>
                </div>
                <div>
                  <h2 className="font-bold text-base sm:text-lg">
                    Grok Assistant
                  </h2>
                  <p className="text-xs sm:text-sm text-base-content/60">
                    AI Assistant
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="btn btn-sm btn-circle btn-ghost"
                title="Close assistant"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((message) => {
                const isBotMessage = message.senderId === "chatbot";
                return (
                  <div
                    key={message._id}
                    className={`flex ${isBotMessage ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs sm:max-w-sm px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
                        isBotMessage
                          ? "bg-base-200 text-base-content"
                          : "bg-primary text-primary-content"
                      }`}
                    >
                      <p className="text-sm sm:text-base break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              {isLoading && (
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
            <div className="border-t border-base-300 p-4 sm:p-6">
              <form
                onSubmit={handleSendMessage}
                className="flex gap-2 sm:gap-3"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Message assistant..."
                  disabled={isLoading || !authUser}
                  className="input input-bordered flex-1 input-sm sm:input-md"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading || !authUser}
                  className="btn btn-primary btn-sm sm:btn-md gap-2"
                >
                  <Send size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantModal;
