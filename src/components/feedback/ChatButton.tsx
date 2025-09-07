import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatModal } from "./ChatModal";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden sm:inline ml-2">Feedback</span>
        </Button>
      </div>
      <ChatModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};