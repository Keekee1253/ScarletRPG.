import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1470813740244-df37b8c1edcb)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundBlend: 'multiply'
      }}
    >
      <Card className="w-full max-w-md mx-4 p-6 bg-background/80 backdrop-blur">
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input id="login-username" {...loginForm.register("username")} />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  Login
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form
              onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input id="register-username" {...registerForm.register("username")} />
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={registerMutation.isPending}
                >
                  Register
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
