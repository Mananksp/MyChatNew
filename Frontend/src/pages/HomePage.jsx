import { useChatStore } from "../store/useChatStore.js";
import Sidebar from "../components/Sidebar.jsx";
import NoChatSelected from "../components/NoChatSelected.jsx";
import ChatContainer from "../components/ChatContainer.jsx";
import ChatbotContainer from "../components/ChatbotContainer.jsx";

const HomePage = () => {
  const { selectedUser, setSelectedUser, isChatbotActive } = useChatStore();

  return (
    <div className="pt-19 sm:pt-16 w-full">
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        <div className="w-full flex gap-2 px-4 md:px-5 py-2 md:py-5">
          <div className="bg-base-100 rounded-lg shadow-lg flex-shrink-0 w-60 h-full overflow-hidden">
            <Sidebar />
          </div>
          <div className="bg-base-100 rounded-lg shadow-lg flex-1 h-full overflow-hidden">
            {isChatbotActive ? (
              <ChatbotContainer />
            ) : !selectedUser ? (
              <NoChatSelected />
            ) : (
              <ChatContainer />
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout - Full screen chat or sidebar */}
      <div className="flex md:hidden h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {isChatbotActive ? (
          <ChatbotContainer onBack={() => setSelectedUser(null)} />
        ) : !selectedUser ? (
          <div className="w-full h-full overflow-hidden">
            <Sidebar />
          </div>
        ) : (
          <ChatContainer onBack={() => setSelectedUser(null)} />
        )}
      </div>
    </div>
  );
};
export default HomePage;
