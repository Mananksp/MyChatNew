import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import NotificationBell from "./NotificationBell.jsx";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-2 sm:px-4 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-all flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h1 className="text-base sm:text-lg font-bold hidden sm:inline">
                Chatty
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Notification Bell - Desktop Only */}
            <div className="hidden md:block">
              <NotificationBell />
            </div>

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              `}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to={"/profile"}
                  className={`btn btn-sm gap-2`}
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Profile</span>
                </Link>

                <button
                  className="btn btn-sm gap-2 flex items-center"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
