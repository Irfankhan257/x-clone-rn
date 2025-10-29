import { Stack } from "expo-router";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import "../global.css";

export default function RootLayout() {
  const queryClient = new QueryClient();
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
