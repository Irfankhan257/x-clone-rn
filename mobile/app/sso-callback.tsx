// app/sso-callback.tsx
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";

export default function SSOCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)");
    }
  }, [isLoaded, isSignedIn]);

  return null;
}
