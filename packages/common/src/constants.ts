export const MAX_AGE_MS = 1000 * 60 * 60 * 12;

export const REDIS_CHANNEL_TRANSFER_STEAM_ITEM = (assetid: string) =>
  `transfer-steam-item-${assetid}`;

export const REDIS_CHANNEL_MINT_STEAM_ITEM = (assetid: string) =>
  `transfer-mint-item-${assetid}`;

// collections
export const CSGO_COLLECTION_PK_DEVNET =
  "D8TeSe5rR7BsVM6YppQPk8SJaNFG4ZaXcmxG686GawgX";
export const CSGO_COLLECTION_PK_MAINNET =
  "8DZ88ZPUek3FUt8wFpJp6X46nhApWxP4NcUU16b7MT8G";

export const SHDW_DRIVE_PK_DEVNET =
  "GGQh8axC7jWKQgsDkxrKTvsssqnHdwXmdDz7ujfVFsxE";
export const SHDW_DRIVE_PK_MAINNET =
  "GqihWcYVfUsHA3VNkhGz1AT59QZ2Lbk1jZHWfjyisyDa";
