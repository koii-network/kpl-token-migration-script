# KPL Migration Guide

## Part A: Install Dependencies
1. **Install Dependencies**：
   - Make sure you installed Node.js/npm/yarn。
     ```bash
     yarn
     ```

2. **Make a Mongo DB Server (on Mongo Atlas)**

3. **Set up Environmental Variables**：
   - Rename '.env.example' to '.env' and fill in the following two lines:
  ```bash
     PRIVATE_KEY=your_private_key_here
     MONGODB_URL=your_mongodb_url_here
     ```

## Part B: Step by Step Edit & Run File

### Step 1. `KPL_backup_on_testnet.js`

- In the `KPL_backup_on_testnet.js` file you'll find an array called  `KPLTokensAddress`. Within line 12 and line 16, please edit and replace all the KPL token addresses with the ones you own to back them up before proceeding.


### Step 2. `KPL_send_out_tokens_on_mainnet.js`

- In the `KPL_send_out_tokens_on_mainnet.js` file, please edit and replaces both line 13 and line 14 (the old and new token address) - repeat if you have multiple addresses.

### Step 3. `KPL_create_new_mint_on_mainnet.js`

- In the `KPL_create_new_mint_on_mainnet.js` file you'll find a parameter with the address  `"http://localhost:8899"`. **When you're done testing**, within line 10 and line 12, please edit and replace the local host address with the following mainnet url: `https://mainnet.koii.network`.

  (Optional: Repeat Step2 and Step3 as needed)

### Step 4. Access https://kpl.koii.network/bind
- Please upload your metadata again through the KPL token portal via the "Bind Metadata" tool.
- *Note: It is encouraged that you can host your icon on your own server.*
