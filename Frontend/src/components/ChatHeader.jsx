import { X, Smile, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState } from "react";

const ChatHeader = ({ onBack }) => {
  const { selectedUser, setSelectedUser, sendMessage } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Quick access emojis
  const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

  // All emojis (limited for performance)
  const allEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "🥲",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😌",
    "😔",
    "😑",
    "😐",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤐",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
    "🤮",
    "🤢",
    "🤮",
    "🤮",
    "🤮",
    "👋",
    "👏",
    "🙏",
    "💪",
    "👍",
    "👎",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🔥",
    "✨",
    "⭐",
    "🌟",
    "💫",
    "🎉",
    "🎊",
    "🎈",
    "🎁",
    "🎀",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
    "😂",
  ];

  const handleEmojiSelect = (emoji) => {
    try {
      sendMessage({ text: emoji });
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send emoji:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-2 border-b border-base-300 bg-base-100 relative z-20 w-full flex items-center justify-between">
      {/* Left side - Back button + Avatar + User info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Back Button Mobile Only */}
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-base-200 rounded-lg transition flex-shrink-0"
            title="Back to chat list"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {/* Avatar */}
        <div className="avatar flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12">
          <div className="rounded-full ring-2 ring-base-300">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
            />
          </div>
        </div>

        {/* User info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base truncate">
            {selectedUser.fullName}
          </h3>
          <p className="text-xs text-base-content/70">
            {onlineUsers.includes(String(selectedUser._id))
              ? "Online"
              : "Offline"}
          </p>
        </div>
      </div>

      {/* Right side - Action buttons only - hide emoji on very small screens */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Emoji button - hidden on mobile */}
        <div className="hidden sm:block relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-base-200 rounded-lg transition duration-200 flex-shrink-0"
            title="Send emoji"
          >
            <Smile size={20} />
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute -right-1 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-2 z-50 w-56 max-h-60 overflow-y-auto">
              {/* Quick Emojis */}
              <div className="mb-2">
                <p className="text-xs text-gray-400 mb-1 font-semibold">
                  Quick:
                </p>
                <div className="flex gap-1 flex-wrap">
                  {quickEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-lg p-1 rounded hover:bg-slate-700 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-600 my-1.5"></div>

              {/* All Emojis */}
              <div>
                <p className="text-xs text-gray-400 mb-1 font-semibold">
                  More:
                </p>
                <div className="grid grid-cols-5 gap-1">
                  {allEmojis.slice(0, 20).map((emoji, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-sm p-1 rounded hover:bg-slate-700 transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Close button - always visible */}
        <button
          onClick={() => setSelectedUser(null)}
          className="p-2 hover:bg-base-200 rounded-lg transition duration-200 flex-shrink-0"
          title="Close chat"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;
