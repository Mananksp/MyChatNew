import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import {
  addReaction as apiAddReaction,
  removeReaction as apiRemoveReaction,
  editMessage as apiEditMessage,
  deleteForMe as apiDeleteForMe,
  deleteForEveryone as apiDeleteForEveryone,
  uploadFileMessage as apiUploadFileMessage,
} from "../lib/messageApi.js";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  scheduledMessages: [],
  isUsersLoading: false,
  isMessagesLoading: false,
  isScheduling: false,
  isChatbotActive: false,
  chatbotMessages: [],
  isChatbotLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  askChatbot: async (text) => {
    try {
      const res = await axiosInstance.post("/chatbot/query", { text });
      return res.data;
    } catch (error) {
      console.error("[chatbot] askChatbot error:", error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Assistant is unavailable right now";
      toast.error(message);
      return null;
    }
  },

  sendChatbotMessage: async (text) => {
    const { chatbotMessages } = get();
    const { authUser } = useAuthStore.getState();

    // Add user message immediately
    const userMessage = {
      _id: `user-${Date.now()}`,
      senderId: authUser._id,
      text: text,
      createdAt: new Date().toISOString(),
    };

    set({
      chatbotMessages: [...chatbotMessages, userMessage],
      isChatbotLoading: true,
    });

    try {
      const res = await axiosInstance.post("/chatbot/query", { text });
      if (res.data?.text) {
        const botMessage = {
          _id: `bot-${Date.now()}`,
          senderId: "chatbot",
          text: res.data.text,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          chatbotMessages: [...state.chatbotMessages, botMessage],
          isChatbotLoading: false,
        }));
      } else {
        toast.error("Failed to get response from assistant");
        set({ isChatbotLoading: false });
      }
    } catch (error) {
      console.error("[chatbot] sendChatbotMessage error:", error);
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Assistant is unavailable";
      toast.error(message);
      set({ isChatbotLoading: false });
    }
  },

  setChatbotActive: (active) => {
    if (active && get().chatbotMessages.length === 0) {
      // Initialize with greeting message
      set({
        isChatbotActive: active,
        chatbotMessages: [
          {
            _id: "intro",
            senderId: "chatbot",
            text: "Hi! I am Grok. Ask me anything — I run through your server so your API key stays private.",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    } else {
      set({ isChatbotActive: active });
    }
  },

  // Refetch messages to catch any missed scheduled deliveries
  refreshMessages: async (userId) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      const newMessages = res.data;

      // Merge with existing messages to preserve local state
      set((state) => {
        const messageMap = new Map();

        // First add existing messages
        state.messages.forEach((msg) =>
          messageMap.set(msg._id.toString(), msg),
        );

        // Then add/update with fresh data from backend
        newMessages.forEach((msg) => messageMap.set(msg._id.toString(), msg));

        // Convert back to array, maintaining order by timestamp
        const merged = Array.from(messageMap.values()).sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );

        return { messages: merged };
      });
    } catch (error) {
      console.error("Failed to refresh messages:", error);
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  scheduleMessage: async (data) => {
    const { selectedUser, messages } = get();
    set({ isScheduling: true });
    try {
      const payload = {
        text: data.text || "",
        image: data.image || null,
        scheduledTime: data.scheduledTime.toISOString(),
      };

      const res = await axiosInstance.post(
        `/messages/schedule/${selectedUser._id}`,
        payload,
      );

      set({ messages: [...messages, res.data] });
      toast.success(
        `Message scheduled for ${new Date(res.data.scheduledTime).toLocaleString()}`,
      );
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to schedule message");
    } finally {
      set({ isScheduling: false });
    }
  },

  cancelScheduledMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/cancel/${messageId}`);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, status: "cancelled" } : msg,
        ),
      }));
      toast.success("Scheduled message cancelled");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to cancel message");
    }
  },

  getScheduledMessages: async () => {
    try {
      const res = await axiosInstance.get("/messages/scheduled/list");
      set({ scheduledMessages: res.data });
    } catch (error) {
      console.error("Failed to fetch scheduled messages:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageScheduled");
    socket.off("messageCancelled");
    socket.off("scheduledMessageSent");
    socket.off("messageDelivered");
    socket.off("reactionAdded");
    socket.off("reactionRemoved");
    socket.off("messageEdited");
    socket.off("messageDeleted");

    // Handle real-time delivered scheduled messages
    socket.on("newMessage", (newMessage) => {
      const getIdString = (id) => {
        if (id === null || id === undefined) return "";
        if (typeof id === "string") return id;
        if (typeof id === "object") {
          if (id._id) return String(id._id);
          if (typeof id.toString === "function") return id.toString();
        }
        return String(id);
      };

      const senderId = getIdString(newMessage.senderId);
      const receiverId = getIdString(newMessage.receiverId);
      const selId = getIdString(selectedUser._id);
      const authId = getIdString(useAuthStore.getState().authUser._id);

      // Check if this message is relevant to current chat
      const isRelevantToChat =
        (senderId === selId && receiverId === authId) ||
        (senderId === authId && receiverId === selId);

      if (!isRelevantToChat) return;

      // Prevent duplicate messages
      const isDuplicate = get().messages.some(
        (msg) => msg._id === newMessage._id,
      );
      if (isDuplicate) {
        // Update existing message if it's a delivery update
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === newMessage._id ? newMessage : msg,
          ),
        }));
        return;
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });

    // Handle scheduled message confirmation
    socket.on("messageScheduled", () => {
      toast.success("Message scheduled successfully");
    });

    // Handle scheduled message cancellation
    socket.on("messageCancelled", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId ? { ...msg, status: "cancelled" } : msg,
        ),
      }));
    });

    // Handle scheduled message sent - UPDATE TIME TO DELIVERY TIME
    socket.on("messageDelivered", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: "sent", deliveredAt: data.deliveredAt }
            : msg,
        ),
      }));
    });

    // Fallback for old event name
    socket.on("scheduledMessageSent", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, status: "sent", deliveredAt: data.deliveredAt }
            : msg,
        ),
      }));
    });

    // ===== NEW: Reaction events =====
    socket.on("reactionAdded", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg,
        ),
      }));
    });

    socket.on("reactionRemoved", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg,
        ),
      }));
    });

    // ===== NEW: Edit event =====
    socket.on("messageEdited", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? {
                ...msg,
                text: data.text,
                isEdited: data.isEdited,
                editedAt: data.editedAt,
              }
            : msg,
        ),
      }));
    });

    // ===== NEW: Delete event =====
    socket.on("messageDeleted", (data) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === data.messageId
            ? {
                ...msg,
                deletedForEveryone: data.deletedForEveryone,
                text: "This message was deleted",
              }
            : msg,
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageScheduled");
    socket.off("messageCancelled");
    socket.off("scheduledMessageSent");
    socket.off("messageDelivered");
    socket.off("reactionAdded");
    socket.off("reactionRemoved");
    socket.off("messageEdited");
    socket.off("messageDeleted");
  },

  // ===== NEW ACTIONS =====

  addReaction: async (messageId, emoji) => {
    try {
      await apiAddReaction(messageId, emoji);
      toast.success("Reaction added");
    } catch (error) {
      toast.error(error.error || "Failed to add reaction");
    }
  },

  removeReaction: async (messageId) => {
    try {
      await apiRemoveReaction(messageId);
    } catch (error) {
      toast.error(error.error || "Failed to remove reaction");
    }
  },

  editMessage: async (messageId, text) => {
    try {
      const res = await apiEditMessage(messageId, text);
      toast.success("Message edited");
      return res;
    } catch (error) {
      toast.error(error.error || "Failed to edit message");
    }
  },

  deleteForMe: async (messageId) => {
    try {
      await apiDeleteForMe(messageId);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.error || "Failed to delete message");
    }
  },

  deleteForEveryone: async (messageId) => {
    try {
      await apiDeleteForEveryone(messageId);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                deletedForEveryone: true,
                text: "This message was deleted",
              }
            : msg,
        ),
      }));
      toast.success("Message deleted for everyone");
    } catch (error) {
      toast.error(error.error || "Failed to delete message");
    }
  },

  uploadFile: async (receiverId, file, text) => {
    try {
      const res = await apiUploadFileMessage(receiverId, file, text);
      set((state) => ({
        messages: [...state.messages, res],
      }));
      toast.success("File uploaded successfully");
      return res;
    } catch (error) {
      toast.error(error.error || "Failed to upload file");
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
