export const MAX_AGE_MS = 1000 * 60 * 60 * 12;

export const REDIS_CHANNEL_TRANSFER_STEAM_ITEM = (assetid: string) =>
  `transfer-steam-item-${assetid}`;

export const REDIS_CHANNEL_MINT_STEAM_ITEM = (assetid: string) =>
  `transfer-mint-item-${assetid}`;

// collections
export const CSGO_COLLECTION_PK_DEVNET =
  "D8TeSe5rR7BsVM6YppQPk8SJaNFG4ZaXcmxG686GawgX";
export const CSGO_COLLECTION_PK_MAINNET = "";

export const SHDW_DRIVE_PK = "GGQh8axC7jWKQgsDkxrKTvsssqnHdwXmdDz7ujfVFsxE";
