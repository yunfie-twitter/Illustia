import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Heart, Home, Search, Settings } from "lucide-react-native";
import { LoadingView } from "@/components/StateViews";
import { useAppTheme } from "@/design/theme";
import { useAuthStore } from "@/stores/authStore";
import { SetupScreen } from "@/features/auth/SetupScreen";
import { RefreshTokenLoginScreen } from "@/features/auth/RefreshTokenLoginScreen";
import { HomeScreen } from "@/features/home/HomeScreen";
import { SearchScreen } from "@/features/search/SearchScreen";
import { BookmarkScreen } from "@/features/bookmark/BookmarkScreen";
import { SettingsScreen } from "@/features/settings/SettingsScreen";
import { IllustDetailScreen } from "@/features/illust/IllustDetailScreen";
import { UserProfileScreen } from "@/features/user/UserProfileScreen";
import type { MainTabParamList, RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

export function RootNavigator() {
  const theme = useAppTheme();
  const bootstrapped = useAuthStore((state) => state.bootstrapped);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary
    }
  };

  if (!bootstrapped) {
    return (
      <NavigationContainer theme={navTheme}>
        <LoadingView label="起動中" />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "900" }
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RefreshTokenLogin" component={RefreshTokenLoginScreen} options={{ title: "Refresh Token" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="IllustDetail" component={IllustDetailScreen} options={({ route }) => ({ title: route.params.title ?? "作品" })} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} options={({ route }) => ({ title: route.params.name ?? "作者" })} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  const theme = useAppTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        }
      }}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "ホーム", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "検索", tabBarIcon: ({ color, size }) => <Search color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Bookmarks"
        component={BookmarkScreen}
        options={{ title: "ブックマーク", tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "設定", tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
      />
    </Tabs.Navigator>
  );
}
