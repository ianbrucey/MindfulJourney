import { useCallback } from "react";

interface Theme {
  primary: string;
  variant: "professional" | "tint" | "vibrant";
  appearance: "light" | "dark" | "system";
  radius: number;
}

export function useTheme() {
  const setTheme = useCallback((theme: Theme) => {
    // Write the theme to theme.json
    fetch("/api/theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(theme),
    }).then(() => {
      // Reload the page to apply the new theme
      window.location.reload();
    });
  }, []);

  return { setTheme };
}
