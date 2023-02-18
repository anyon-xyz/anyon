# 🕳️  Anyon

A platform for wrapping Steam skins into NFTs on the Solana blockchain

The goal is to take out centralized resale sites of skins that buy at prices far below the market and keep it up to you since you cant sell it for money outside of steam. You can now wrap and sell your item for SOL, USDC or any spl token.

## Running locally

- Create `.env` file

```sh
$ docker-compose up --build -d
$ yarn dev
```


## How it will works
  - Wrapping - The user will transfer their item to our Steam escrow and then mint a new NFT for that item

  - Unwrapping - To get the item back to your Steam account, the item needs to be unlocked (after 7 days since wrapped) and then the user will burn this NFT and we will send the item from our Steam escrow to the user's Steam.

Also, once wrapped, the user will be able to sell the NFT for SOL/USDC and will be listed in marketplaces like MagicEden and Hyperspace.

## Mvp goals
  - Wrap and unwrap csgo skins
  - List wrapped skins in solana marketplaces
  - Images tags - locked or unlocked - 7d after the wrap
  
## Ideas
  - Build our own marketplace inside the app for better user experience
  - Update image tag using [Clockwork](https://www.clockwork.xyz/)


## License

This project is distributed under the [MIT license](LICENSE)