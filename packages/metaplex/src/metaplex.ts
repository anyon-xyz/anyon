import { getConnection } from "@anyon/common";
import { getEnv } from "@anyon/env";
import { keypairIdentity, Metadata, Metaplex } from "@metaplex-foundation/js";
import { Keypair, PublicKey } from "@solana/web3.js";

export const metaplex = () => {
  const connection = getConnection("mainnet-beta");
  const metaplex = new Metaplex(connection);

  const getKeypair = () => {
    const { CSGO_AUTHORITY_COLLECTION_SECRET } = getEnv([
      "CSGO_AUTHORITY_COLLECTION_SECRET",
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const secretKey = JSON.parse(CSGO_AUTHORITY_COLLECTION_SECRET) as any[];

    const kp = Keypair.fromSecretKey(Uint8Array.from(secretKey));

    return kp;
  };

  const setSecretKey = () => {
    const kp = getKeypair();

    metaplex.use(keypairIdentity(kp));
  };

  const createMetadata = (
    name: string,
    image: string,
    imageType: string,
    attributes: {
      trait_type: string;
      value: string;
    }[]
  ) => {
    return {
      name,
      symbol: "ANYON",
      description: "",
      seller_fee_basis_points: 200,
      image,
      external_url: "https://anyon.io/",
      attributes: [...attributes],
      properties: {
        files: [
          {
            uri: image,
            type: imageType,
          },
        ],
        category: "image",
      },
    };
  };

  const mint = async (name: string, uri: string, collectionPk: PublicKey) => {
    const kp = getKeypair();

    const { nft, response } = await metaplex.nfts().create({
      uri,
      name,
      sellerFeeBasisPoints: 200, // 2%
      updateAuthority: kp,
      collection: collectionPk,
      collectionAuthority: kp,
    });

    return {
      nft,
      response,
    };
  };

  const getBurnTx = (mint: PublicKey) => {
    const tx = metaplex.nfts().builders().delete({
      mintAddress: mint,
    });
    return tx;
  };

  const getNftsByCreator = async (creator: PublicKey) => {
    const nfts = await metaplex.nfts().findAllByCreator({
      creator,
    });

    return nfts;
  };

  const getAllNftsByUserPk = async (user: PublicKey) => {
    const nfts = await metaplex.nfts().findAllByOwner({
      owner: new PublicKey(user),
    });

    return nfts;
  };

  const getNftByMetadata = async (metadata: Metadata) => {
    const nft = await metaplex.nfts().load({
      metadata,
    });
    return nft;
  };

  return {
    metaplex,
    setSecretKey,
    mint,
    createMetadata,
    getBurnTx,
    getNftsByCreator,
    getAllNftsByUserPk,
    getNftByMetadata,
  };
};
