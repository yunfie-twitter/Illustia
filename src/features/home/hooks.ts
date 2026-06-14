import { useInfiniteQuery } from "@tanstack/react-query";
import { getNewIllusts, getNextPage, getRankingIllusts, getRecommendedIllusts } from "@/lib/pixiv/client";
import type { HomeFeedConfig } from "@/types/navigation";
import type { PixivIllust } from "@/types/pixiv";

export function useHomeFeed(config: HomeFeedConfig) {
  return useInfiniteQuery({
    queryKey: ["homeFeed", config.kind, config.rankingMode],
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) => {
      if (pageParam) return getNextPage<PixivIllust>(pageParam);
      if (config.kind === "ranking") return getRankingIllusts(config.rankingMode);
      if (config.kind === "new") return getNewIllusts();
      return getRecommendedIllusts();
    },
    getNextPageParam: (lastPage) => lastPage.nextUrl
  });
}
