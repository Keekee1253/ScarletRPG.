import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";
import { format } from "date-fns";

export default function ChatInterface() {
  const { messages, sendMessage } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !file) return;

    let fileUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      fileUrl = URL.createObjectURL(file);
    }

    await sendMessage(input, fileUrl);
    setInput("");
    setFile(null);
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <ScrollArea ref={scrollRef} className="flex-1 pr-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <Avatar>
                    <AvatarImage src="https://images.unsplash.com/photo-1499557354967-2b2d8910bcca" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xs font-medium mb-1">
                    {isCurrentUser ? user.username : `User ${message.senderId}`}
                  </p>
                  <p>{message.content}</p>
                  {message.fileUrl && (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline"
                    >
                      Attached File
                    </a>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {format(message.timestamp ? new Date(message.timestamp) : new Date(), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}