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

async function getTokenDistribution(mintAddress, excludedAccounts) {
  // Get all token accounts for the mint
  const accounts = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: AccountLayout.span, // AccountLayout.span is 165 bytes
      },
      {
        memcmp: {
          offset: 0, // where the mint address starts in the account data
          bytes: mintAddress, // filtering by the specific mint address
        },
      },
    ],
  });

  // Process each account to get its balance and owner
  const result = accounts.map((account) => {
    const accountData = AccountLayout.decode(account.account.data);
    const owner = new PublicKey(accountData.owner);
    const balance = accountData.amount; // raw balance in smallest units (lamports of the token)
    if (!excludedAccounts.includes(owner.toBase58())) {
      return { owner: owner.toBase58(), balance: balance };
    }
  });
  return result;
}
async function addToMongoDB(result, collectionName) {
  const client = new MongoClient(process.env.MONGODB_URL);
  await client.connect();
  const db = client.db("Migration");
  const collection = db.collection(`KPL_${collectionName}`);
  await collection.insertMany(result);
  await client.close();
}
async function getExcludedAccounts() {
  console.log("Getting KPL program accounts");
  const programId = new PublicKey(
    "KPLTRVs6jA7QTthuJH2cEmyCEskFbSV2xpZw46cganN",
  );

  // Fetch the program accounts
  const KPLProgramAccounts = await connection.getProgramAccounts(programId, {
    dataSlice: { offset: 0, length: 0 }, // Fetch only metadata, not full data
    filters: [], // No filters
  });

  console.log("KPL program accounts fetched");

  // Map the accounts to their base58 string public keys
  const accountKeys = KPLProgramAccounts.map((account) =>
    account.pubkey.toBase58(),
  );

  // Return the array of public key strings
  return accountKeys;
}
async function main() {
  const excludedAccounts = await getExcludedAccounts();
  for (const address of KPLTokensAddress) {
    const result = await getTokenDistribution(address, excludedAccounts);
    await addToMongoDB(result, address);
  }
}

main();
