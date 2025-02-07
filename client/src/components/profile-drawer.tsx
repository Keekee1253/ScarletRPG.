import { Drawer } from "vaul";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1499557354967-2b2d8910bcca",
  "https://images.unsplash.com/photo-1503235930437-8c6293ba41f5",
  "https://images.unsplash.com/photo-1502323777036-f29e3972d82f",
  "https://images.unsplash.com/photo-1533636721434-0e2d61030955",
  "https://images.unsplash.com/photo-1506863530036-1efeddceb993",
  "https://images.unsplash.com/photo-1579783902915-f0b0de2c2eb3",
];

export default function ProfileDrawer() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar);
  const [username, setUsername] = useState(user?.username || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { avatar?: string; fileUrl?: string; username?: string }) => {
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        // In a real app, implement file upload to a storage service here
        const fileUrl = URL.createObjectURL(uploadedFile);
        data.fileUrl = fileUrl;
      }
      const res = await apiRequest("PATCH", "/api/user", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "File size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }
      setUploadedFile(file);
      setSelectedAvatar(URL.createObjectURL(file));
      updateProfileMutation.mutate({ fileUrl: URL.createObjectURL(file) });
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && username !== user?.username) {
      updateProfileMutation.mutate({ username });
    }
  };

  return (
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
      <Drawer.Content className="bg-background fixed bottom-0 left-0 right-0 mt-24 rounded-t-[10px] flex flex-col h-[96%]">
        <div className="p-4 bg-muted/40 rounded-t-[10px] flex-1">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-8" />
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Profile</h2>

            <div className="space-y-4">
              <form onSubmit={handleUsernameSubmit} className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter new username"
                  />
                  <Button 
                    type="submit" 
                    disabled={!username.trim() || username === user?.username}
                  >
                    Save
                  </Button>
                </div>
              </form>

              <div>
                <Label>Current Avatar</Label>
                <div className="mt-2 flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedAvatar || user?.fileUrl} />
                    <AvatarFallback>
                      {username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div>
                <Label>Upload Custom Avatar</Label>
                <div className="mt-2 flex justify-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 5MB. Supported formats: PNG, JPEG, GIF
                </p>
              </div>

              <div>
                <Label>Or Choose Avatar</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => {
                        setSelectedAvatar(avatar);
                        updateProfileMutation.mutate({ avatar });
                      }}
                      className={`relative rounded-lg overflow-hidden ${
                        selectedAvatar === avatar ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="destructive"
                className="w-full"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </Drawer.Content>
    </Drawer.Portal>
  );
}