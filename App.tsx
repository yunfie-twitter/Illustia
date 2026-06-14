import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { RootNavigator } from "@/navigation/RootNavigator";
import { useBootstrapAuth } from "@/features/auth/useBootstrapAuth";

export default function App() {
  useBootstrapAuth();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
        <StatusBar barStyle="default" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
