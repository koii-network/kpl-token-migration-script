import { createMint } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
const privateKeyArray = process.env.PRIVATE_KEY.split(",").map(Number);
const payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
const freezeAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));

const connection = new Connection(
  /***********DO NOT EDIT ABOVE THIS LINE***********/
  "http://localhost:8899",
  /***********DO NOT EDIT BELOW THIS LINE***********/
  "confirmed",
);

const mint = await createMint(
  connection,
  payer,
  mintAuthority.publicKey,
  freezeAuthority.publicKey,
  9,
);

console.log(mint.toBase58());