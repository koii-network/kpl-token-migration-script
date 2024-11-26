# KPL Migration Guide  
## Env
1. **Install Dependencies**：
   - Make sure you installed Node.js/npm/yarn。
     ```bash
     yarn
     ```
2. **Set up Environmental Variables**：
   - Follow the .env.example pattern to create a .env file
   - ```
     PRIVATE_KEY=your_private_key_here
     MONGODB_URL=your_mongodb_url_here
     ```
## Step by Step Edit & Run File
### 1. `KPL_backup_on_testnet.js`
- Please edit your token address in the `KPLTokensAddress` array.
  ```javascript:KPL_backup_on_testnet.js
  startLine: 12
  endLine: 16
  ```
### 2. `KPL_create_new_mint_on_mainnet.js`
- Please edit it to the mainnet address
  ```javascript:KPL_create_new_mint_on_mainnet.js
  startLine: 8
  endLine: 12
  ```
### 3. `KPL_send_out_tokens_on_mainnet.js`
- Please edit the old and new token address.
- Then repeat if you have multiple addresses
  ```javascript:KPL_send_out_tokens_on_mainnet.js
  startLine: 13
  endLine: 15
  ```
Repeat Step2 and Step3 as needed.