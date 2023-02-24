import { getEnv } from "@anyon/env";
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";

export const metaplex = () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"));
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

  return {
    metaplex,
    setSecretKey,
    mint,
  };
};
