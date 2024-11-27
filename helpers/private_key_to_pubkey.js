import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();
console.log(process.env.PRIVATE_KEY);
const privateKeyArray = process.env.PRIVATE_KEY.split(",").map(Number);
console.log(privateKeyArray);

const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));

const publicKey = keypair.publicKey.toString();

console.log("Public Key:", publicKey);
