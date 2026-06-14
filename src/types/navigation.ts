import type { NavigatorScreenParams } from "@react-navigation/native";
import type { RankingMode } from "@/types/pixiv";

export type RootStackParamList = {
  Setup: undefined;
  RefreshTokenLogin: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  IllustDetail: { illustId: number; title?: string };
  UserProfile: { userId: number; name?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookmarks: undefined;
  Settings: undefined;
};

export type HomeFeedKind = "recommended" | "ranking" | "new";

export interface HomeFeedConfig {
  kind: HomeFeedKind;
  title: string;
  rankingMode?: RankingMode;
}
