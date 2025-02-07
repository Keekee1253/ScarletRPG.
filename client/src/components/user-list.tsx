import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Shield, UserPlus, UserX } from "lucide-react";

interface UserListProps {
  className?: string;
}

export default function UserList({ className = "" }: UserListProps) {
  const { friends, addFriend, updateFriendStatus } = useChat();
  const { user } = useAuth();
  const [showBlocked, setShowBlocked] = useState(false);

  const filteredFriends = friends.filter((friend) =>
    showBlocked
      ? friend.status === "blocked"
      : friend.status !== "blocked"
  );

  return (
    <div className={`bg-sidebar p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBlocked(!showBlocked)}
          className="flex items-center gap-2"
        >
          {showBlocked ? (
            <>
              <UserPlus className="h-4 w-4" />
              Show Friends
            </>
          ) : (
            <>
              <UserX className="h-4 w-4" />
              Show Blocked
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-2">
          {filteredFriends.map((friend) => {
            const isCurrentUser = friend.userId === user?.id;
            const otherId = isCurrentUser ? friend.friendId : friend.userId;

            return (
              <div
                key={friend.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="https://images.unsplash.com/photo-1499557354967-2b2d8910bcca" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>User {otherId}</span>
                </div>

                <div className="flex gap-2">
                  {friend.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFriendStatus(friend.id, "accepted")
                      }
                      className="flex items-center gap-1"
                    >
                      <UserPlus className="h-4 w-4" />
                      Accept
                    </Button>
                  )}
                  {friend.status !== "blocked" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        updateFriendStatus(friend.id, "blocked")
                      }
                      className="flex items-center gap-1"
                    >
                      <UserX className="h-4 w-4" />
                      Block
                    </Button>
                  )}
                  {friend.status === "blocked" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateFriendStatus(friend.id, "accepted")
                      }
                      className="flex items-center gap-1"
                    >
                      <Shield className="h-4 w-4" />
                      Unblock
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}