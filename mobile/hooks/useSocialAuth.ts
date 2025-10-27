import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true);

    try {
      // 👇 Create a valid redirect URL that matches your Expo Router page
      const redirectUrl = Linking.createURL("/sso-callback");

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl, // <-- THIS IS REQUIRED
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.log("error in social auth", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";

      Alert.alert(
        "Error",
        `Failed to sign in with ${provider}. Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSocialAuth };
};
