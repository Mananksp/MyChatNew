import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { Send, Clock, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import ScheduleModal from "./ScheduleModal";
import { uploadFileMessage } from "../lib/messageApi";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, scheduleMessage, isScheduling, selectedUser } =
    useChatStore();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage({
        text: text.trim(),
      });

      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size must be under 100MB");
      return;
    }

    setIsUploading(true);
    try {
      await uploadFileMessage(selectedUser._id, file, text.trim());
      setText("");
      toast.success("File sent successfully");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleScheduleMessage = async (scheduledDateTime) => {
    if (!text.trim()) {
      toast.error("Please add text to schedule");
      return;
    }

    try {
      await scheduleMessage({
        text: text.trim(),
        scheduledTime: scheduledDateTime,
      });

      setText("");
      setShowScheduleModal(false);
    } catch (error) {
      console.error("Failed to schedule message:", error);
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 w-full">
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-1.5 sm:gap-2"
      >
        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp3,.wav,.mp4,.webm"
        />

        {/* File Picker Button */}
        <button
          type="button"
          className="btn btn-xs sm:btn-sm btn-circle text-blue-400 hover:bg-blue-900 disabled:opacity-50 flex-shrink-0"
          title="Send file"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
        >
          <Paperclip size={16} className="sm:w-5 sm:h-5" />
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-xs sm:input-sm"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-xs sm:btn-sm btn-circle text-orange-400 hover:bg-orange-900 flex-shrink-0 disabled:opacity-50"
          title="Schedule Message"
          onClick={() => {
            setShowScheduleModal(true);
          }}
          disabled={isScheduling}
        >
          <Clock size={16} className="sm:w-5 sm:h-5" />
        </button>

        <button
          type="submit"
          className="btn btn-xs sm:btn-sm btn-circle flex-shrink-0"
          disabled={!text.trim()}
        >
          <Send size={16} className="sm:w-5 sm:h-5" />
        </button>
      </form>

      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={handleScheduleMessage}
        isLoading={isScheduling}
      />
    </div>
  );
};
export default MessageInput;
