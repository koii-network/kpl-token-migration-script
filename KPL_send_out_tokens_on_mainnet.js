import { Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { MongoClient } from "mongodb";
import { Keypair } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

const privateKeyString = process.env.PRIVATE_KEY;
const privateKeyArray = privateKeyString.split(",").map(Number);
const senderKeypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
/***********DO NOT EDIT ABOVE THIS LINE***********/
const oldMintAddress = "FJG2aEPtertCXoedgteCCMmgngSZo1Zd715oNBzR7xpR";
const newMintAddress = "7gWY3DyG9CWii9UhC8y27HFexH2yYWeYJKfJ6sofs46W";
const connection = new Connection("https://mainnet.koii.network", "confirmed");
/***********DO NOT EDIT BELOW THIS LINE***********/
const BATCH_SIZE = 10;
const client = new MongoClient(process.env.MONGODB_URL);

async function readFromMongoDB(collectionName) {
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  const query = { status: { $nin: ["Success", "Unknown"] } };
  const results = await collection.find(query).toArray();
  return results;
}

async function updateTransactionResult(
  collectionName,
  query,
  { status, signature },
) {

  
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  await collection.updateOne(query, { $set: { status, signature } });
}

async function createTokenAccount(mintAddress, toAddress) {
  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      new PublicKey(mintAddress),
      new PublicKey(toAddress),
    );
    return tokenAccount;
  } catch (error) {
    console.log("ERROR INFO FOR CREATE TOKEN ACCOUNT", mintAddress, toAddress);

    console.log(error);
    return null;
  }
}

async function sendToken(mintAddress, amount, toAddress) {
  if (amount == 0) {
    return { status: "Success", signature: null };
  }

  try {
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      senderKeypair,
      new PublicKey(mintAddress),
      new PublicKey(toAddress),
    );

    const signature = await mintTo(
      connection,
      senderKeypair,
      new PublicKey(mintAddress),
      tokenAccount.address,
      senderKeypair,
      amount,
    );
    return { status: "Success", signature: signature };
  } catch (error) {
    console.log(error);
    return { status: "Failed", signature: null };
  }
}

async function processBatch(batch) {
  const createTokenPromises = batch.map((response) =>
    createTokenAccount(newMintAddress, response.owner),
  );
  await Promise.all(createTokenPromises);

  const sendTokenPromises = batch.map(async (response, index) => {
    if (
      response.status &&
      (response.status == "Success" || response.status == "Unknown")
    ) {
      console.log("Skipping", response.owner);
      return null;
    }

    const { status, signature } = await sendToken(
      newMintAddress,
      response.balance,
      response.owner,
    );
    console.log(status, signature);
    await updateTransactionResult(
      oldMintAddress,
      { _id: response._id },
      { status, signature },
    );
    return { status, signature };
  });

  await Promise.all(sendTokenPromises);
}

async function main() {
  const responses = await readFromMongoDB(oldMintAddress);
  for (let i = 0; i < responses.length; i += BATCH_SIZE) {
    const batch = responses.slice(i, i + BATCH_SIZE);
    await processBatch(batch);
  }
}

main();

process.on('exit', () => {
  client.close();
});
