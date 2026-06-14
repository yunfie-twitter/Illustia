export type RankingMode =
  | "day"
  | "week"
  | "month"
  | "day_male"
  | "day_female"
  | "week_original"
  | "week_rookie"
  | "day_r18"
  | "day_male_r18"
  | "day_female_r18"
  | "week_r18"
  | "week_r18g"
  | "day_manga"
  | "week_manga"
  | "month_manga";

export type SearchSort = "date_desc" | "date_asc" | "popular_desc";
export type BookmarkThreshold = "0" | "50" | "100" | "300" | "500" | "1000" | "3000" | "5000" | "10000";
export type SearchTarget =
  | "partial_match_for_tags"
  | "exact_match_for_tags"
  | "title_and_caption";
export type Restrict = "public" | "private";
export type ImageQuality = "medium" | "large" | "original";
export type ThemePreference = "system" | "light" | "dark";

export interface PixivImageUrls {
  square_medium: string;
  medium: string;
  large?: string;
}

export interface PixivUser {
  id: number;
  name: string;
  account: string;
  profile_image_urls: {
    medium: string;
  };
  comment: string;
  is_followed: boolean;
}

export interface PixivTag {
  name: string;
  translated_name?: string | null;
}

export interface PixivMetaPage {
  image_urls: {
    square_medium: string;
    medium: string;
    large: string;
    original: string;
  };
}

export interface PixivIllust {
  id: number;
  title: string;
  type: string;
  image_urls: PixivImageUrls;
  caption: string;
  restrict: number;
  user: PixivUser;
  tags: PixivTag[];
  create_date: string;
  page_count: number;
  width: number;
  height: number;
  sanity_level: number;
  meta_single_page: {
    original_image_url?: string;
  };
  meta_pages: PixivMetaPage[];
  total_view: number;
  total_bookmarks: number;
  is_bookmarked: boolean;
  visible: boolean;
  x_restrict: number;
  total_comments: number;
}

export interface PixivUserDetail {
  user: PixivUser;
  profile: {
    webpage: string;
    total_follow_users: number;
    total_illusts: number;
    total_manga: number;
    total_illust_bookmarks_public: number;
    background_image_url: string;
    twitter_url: string;
  };
  workspace?: {
    comment: string;
    workspace_image_url: string | null;
  };
}

export interface PageResult<T> {
  items: T[];
  nextUrl: string | null;
}

export interface SearchIllustOptions {
  sort?: SearchSort;
  searchTarget?: SearchTarget;
  r18?: boolean;
  minBookmarks?: BookmarkThreshold;
}

export interface ApiErrorShape {
  message: string;
  code?: string;
  cause?: unknown;
}
