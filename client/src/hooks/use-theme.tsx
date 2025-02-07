import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const updateThemeMutation = useMutation({
    mutationFn: async (theme: Theme) => {
      const res = await apiRequest("PATCH", "/api/user", { theme });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const setTheme = (newTheme: Theme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (user) {
      updateThemeMutation.mutate(newTheme);
    }
  };

  useEffect(() => {
    // Initialize theme from user preferences or system default
    const theme = user?.theme as Theme || "dark";
    setTheme(theme);
  }, [user?.theme]);

  return (
    <ThemeContext.Provider 
      value={{ 
        theme: user?.theme as Theme || "dark", 
        setTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}