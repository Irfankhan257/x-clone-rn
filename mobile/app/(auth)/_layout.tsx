import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { HeaderShownContext, HeaderTitle } from "@react-navigation/elements";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return <Stack />;
}
