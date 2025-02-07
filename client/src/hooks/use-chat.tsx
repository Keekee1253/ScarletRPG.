import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { Message, User, Friend } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatContextType {
  messages: Message[];
  sendMessage: (content: string, fileUrl?: string) => void;
  friends: Friend[];
  addFriend: (friendId: number) => void;
  updateFriendStatus: (friendId: number, status: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket>();
  const [messages, setMessages] = useState<Message[]>([]);

  const { data: initialMessages = [] } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const { data: friends = [] } = useQuery<Friend[]>({
    queryKey: ["/api/friends"],
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const res = await apiRequest("POST", "/api/friends", {
        friendId,
        status: "pending",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  const updateFriendMutation = useMutation({
    mutationFn: async ({
      friendId,
      status,
    }: {
      friendId: number;
      status: string;
    }) => {
      const res = await apiRequest("PATCH", `/api/friends/${friendId}`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
  });

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", userId: user.id }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      ws.close();
    };
  }, [user]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const sendMessage = async (content: string, fileUrl?: string) => {
    if (!user || !wsRef.current) return;

    const message = { content, fileUrl, senderId: user.id };
    await apiRequest("POST", "/api/messages", message);
    wsRef.current.send(JSON.stringify(message));
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        friends,
        addFriend: (friendId) => addFriendMutation.mutate(friendId),
        updateFriendStatus: (friendId, status) =>
          updateFriendMutation.mutate({ friendId, status }),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
