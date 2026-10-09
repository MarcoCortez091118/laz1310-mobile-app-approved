import { apiRequest } from '../../api/client';

export interface BannerLink {
  kind: 'page' | 'external';
  target: string;
}

export interface BannerItem {
  title: string;
  imageUrl: string | null;
  link: BannerLink | null;
}

interface CardsBlock {
  type: 'cards';
  id: string;
  items: BannerItem[];
}

interface UnknownBlock {
  type: string;
  id: string;
}

interface BannerPage {
  slug: string;
  title: string;
  blocks: Array<CardsBlock | UnknownBlock>;
}

function releaseQuery(releaseId: string | null) {
  return releaseId ? `?releaseId=${encodeURIComponent(releaseId)}` : '';
}

export async function getHomeBanners(
  releaseId: string | null,
): Promise<BannerItem[]> {
  const page = await apiRequest<BannerPage>(
    `/api/v1/pages/home-banners${releaseQuery(releaseId)}`,
  );
  const block = page.blocks.find(
    (item): item is CardsBlock => item.type === 'cards' && 'items' in item,
  );

  return (block?.items ?? []).filter(
    (item) => Boolean(item.imageUrl?.trim()),
  );
}
