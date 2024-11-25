import { Connection, PublicKey } from "@_koii/web3.js";
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
const newMintAddress = "GtkfJzxNqLpye1GwPUTQZRNgwZfjpeQPRrhv5PyBwEhA";
const connection = new Connection("http://localhost:8899", "confirmed");
/***********DO NOT EDIT BELOW THIS LINE***********/
async function readFromMongoDB(collectionName, query = {}) {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  const results = await collection.find(query).toArray();
  await client.close();
  return results;
}

async function updateTransactionResult(
  collectionName,
  query,
  { status, signature },
) {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  await collection.updateOne(query, { $set: { status, signature } });
  await client.close();
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
    const signatureMatch = error.message.match(/signature (\w+)/);
    const signature = signatureMatch
      ? signatureMatch[1]
      : "Signature not found";
    if (signature == "Signature not found") {
      console.log(error);
      return { status: "Failed", signature: null };
    }

    for (let i = 0; i < 10; i++) {
      const result = await connection.getSignatureStatus(signature);

      if (result?.value?.err != null) {
        return { status: "Failed", signature: signature };
      }
      if (
        result?.value?.confirmationStatus == "finalized" ||
        result?.value?.confirmationStatus == "confirmed"
      ) {
        console.log("Transaction is Confirmed!");
        return { status: "Success", signature: signature };
      }
      if (result?.value?.confirmationStatus == "processed") {
        console.log("Transaction Processing.");
        continue;
      }
    }
    return { status: "Unknown", signature: signature };
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
    )
      return null;

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
  for (let i = 0; i < responses.length; i += 10) {
    const batch = responses.slice(i, i + 10);
    await processBatch(batch);
  }
}

main();
