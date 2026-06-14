import type { ImageQuality, PixivIllust } from "@/types/pixiv";

export const PIXIV_IMAGE_HEADERS = {
  Referer: "https://www.pixiv.net/"
};

export function getIllustImageUrl(illust: PixivIllust, quality: ImageQuality) {
  if (quality === "original") {
    return (
      illust.meta_single_page.original_image_url ??
      illust.meta_pages[0]?.image_urls.original ??
      illust.image_urls.large ??
      illust.image_urls.medium
    );
  }

  if (quality === "large") {
    return illust.meta_pages[0]?.image_urls.large ?? illust.image_urls.large ?? illust.image_urls.medium;
  }

  return illust.image_urls.medium;
}

export function getIllustPageUrls(illust: PixivIllust, quality: ImageQuality) {
  if (illust.meta_pages?.length) {
    return illust.meta_pages.map((page) =>
      quality === "original" ? page.image_urls.original : quality === "large" ? page.image_urls.large : page.image_urls.medium
    );
  }

  return [getIllustImageUrl(illust, quality)];
}
