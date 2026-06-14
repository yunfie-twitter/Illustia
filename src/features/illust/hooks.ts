import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBookmark, getIllustDetail, removeBookmark } from "@/lib/pixiv/client";
import type { Restrict } from "@/types/pixiv";

export function useIllustDetail(illustId: number) {
  return useQuery({
    queryKey: ["illust", illustId],
    queryFn: () => getIllustDetail(illustId)
  });
}

export function useBookmarkMutation(illustId: number) {
  const queryClient = useQueryClient();

  const add = useMutation({
    mutationFn: (restrict: Restrict) => addBookmark(illustId, restrict),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["illust", illustId] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });

  const remove = useMutation({
    mutationFn: () => removeBookmark(illustId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["illust", illustId] });
      await queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });

  return { add, remove, isPending: add.isPending || remove.isPending };
}
