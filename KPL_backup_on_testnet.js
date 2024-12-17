import { Connection, PublicKey } from "@_koii/web3.js";
import { TOKEN_PROGRAM_ID, AccountLayout } from "@solana/spl-token";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URL) {
  console.error("NO MONGODB_URL");
  process.exit(1);
}
/********************** DO NOT EDIT ABOVE THIS LINE **********************/
const KPLTokensAddress = [
  "FJG2aEPtertCXoedgteCCMmgngSZo1Zd715oNBzR7xpR", // FIRE
  "us8mD4jGkFWnUuAHB8V5ZcrAosEqi2h1Zcyca68QA1G", // BIRD
  "9UcQaSsBTeXowhMBgSbTEeQubGHxXDNJRjz4s7uxibTP", // BBIG
];
/************************DO NOT EDIT BELOW THIS LINE************************/
const connection = new Connection("https://testnet.koii.network", "confirmed");

async function getTokenDistribution(mintAddress) {
  const url = `https://kpltoken.api.koii.network/api/metadata/testnetDistribution?mintAddress=${mintAddress}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
async function addToMongoDB(result, collectionName) {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  await collection.insertMany(result);
  await client.close();
}

async function main() {
  for (const address of KPLTokensAddress) {
    const result = await getTokenDistribution(address);
    await addToMongoDB(result, address);
  }
}

main();
