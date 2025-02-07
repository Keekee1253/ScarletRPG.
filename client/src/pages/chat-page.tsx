import { ChatProvider } from "@/hooks/use-chat";
import ChatInterface from "@/components/chat-interface";
import ProfileDrawer from "@/components/profile-drawer";
import UserList from "@/components/user-list";
import ThemeToggle from "@/components/theme-toggle";
import { Drawer } from "vaul";
import { useTheme } from "@/hooks/use-theme";

export default function ChatPage() {
  const { theme } = useTheme();

  return (
    <ChatProvider>
      <div 
        className="min-h-screen flex flex-col transition-all duration-500"
        style={{
          backgroundImage: theme === 'light' 
            ? 'url(https://images.unsplash.com/photo-1513002749550-c59d786b8e6c)' // Bright blue sky
            : 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba)', // Night sky
          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.85)',
          backgroundBlendMode: 'overlay',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="flex-1 flex backdrop-blur-sm">
          <UserList className="w-64 hidden md:block bg-background/80" />
          <main className="flex-1 flex flex-col">
            <div className="p-4 flex justify-between items-center bg-background/80">
              <Drawer.Root>
                <Drawer.Trigger asChild>
                  <button className="text-foreground hover:text-primary">
                    Profile
                  </button>
                </Drawer.Trigger>
                <ProfileDrawer />
              </Drawer.Root>
              <ThemeToggle />
            </div>
            <ChatInterface />
          </main>
        </div>
      </div>
    </ChatProvider>
  );
}