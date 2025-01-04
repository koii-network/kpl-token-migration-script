import { createMint } from "@solana/spl-token";
import { Connection, Keypair } from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();
const privateKeyArray = process.env.PRIVATE_KEY.split(",").map(Number);
const payer = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
const freezeAuthority = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
const connection = new Connection(
  /***********DO NOT EDIT ABOVE THIS LINE***********/
  "https://mainnet.koii.network", // Change to mainnet url
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
