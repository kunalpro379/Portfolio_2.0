import { useState, useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { useLocation } from "@tanstack/react-router";

export function GlobalChatFAB({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const isRootPage = location.pathname === "/";
  const isVisible = isRootPage ? isScrolled : true;

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 100px
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-[#742308] ${
          isVisible && !isOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"
        }`}
        aria-label="Chat with Kunal"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Invisible Overlay to close when clicking outside (optional, but good for UX) */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-[101] w-full max-w-[300px] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="font-display text-sm font-semibold text-black">Chat with Kunal</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-black/50 transition-colors hover:bg-black/5 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Interface Container */}
        <div className="flex h-[calc(100vh-53px)] flex-col bg-white">
          <ChatInterface />
        </div>
      </div>
    </>
  );
}
