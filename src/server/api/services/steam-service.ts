import type { Redis } from "ioredis";
import { request } from "../../../utils/fetch";

export interface Asset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

export interface Description2 {
  type: string;
  value: string;
  color: string;
}

export interface Action {
  link: string;
  name: string;
}

export interface MarketAction {
  link: string;
  name: string;
}

export interface Tag {
  category: string;
  internal_name: string;
  localized_category_name: string;
  localized_tag_name: string;
  color: string;
}

export interface Description {
  appid: number;
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  descriptions: Description2[];
  tradable: number;
  actions: Action[];
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  market_actions: MarketAction[];
  commodity: number;
  market_tradable_restriction: number;
  marketable: number;
  tags: Tag[];
  icon_url_large: string;
}

export interface CsgoInventory {
  assets: Asset[];
  descriptions: Description[];
  more_items: number;
  last_assetid: string;
  total_inventory_count: number;
  success: number;
  rwgrsn: number;
  error?: string;
  code?: string;
}

const CSGO_APP_ID = 730;

// http://steamcommunity.com/profiles/<STEAMID>/inventory/json/<APPID>/2
export const getCsgoInventory = async (
  redis: Redis,
  steamId: string,
  forceFetch?: boolean
): Promise<CsgoInventory> => {
  const memoize = await redis.get(steamId);

  if (memoize && !forceFetch) {
    const cachedInventory = JSON.parse(memoize) as CsgoInventory;

    return cachedInventory;
  }

  const response = await request<CsgoInventory>(
    `https://api.steamapis.com/steam/inventory/${steamId}/${CSGO_APP_ID}/2?api_key=_-P8rpyPpZbRDy34ec-9d5wFhOA`,
    "GET",
    {}
  );

  if (!response.success) {
    throw new Error("Fail to request steam inventory");
  }

  // cache for 24hours
  await redis.set(steamId, JSON.stringify(response), "EX", 86400);

  return response;
};
