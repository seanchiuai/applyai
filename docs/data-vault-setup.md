# Stack Auth Data Vault Setup Guide

This guide explains how to set up Stack Auth's Data Vault for secure credit card storage.

## Prerequisites

- Stack Auth account at https://app.stack-auth.com/
- Project already configured in Stack Auth

## Step 1: Create Data Vault Store

1. Go to https://app.stack-auth.com/
2. Select your project
3. Navigate to **Data Vault** section (or equivalent settings area)
4. Create a new Data Vault store with:
   - **Store ID**: `creditcard-info` (or any ID you prefer)
   - Configure encryption settings as needed

## Step 2: Generate Vault Secret

Generate a secure random secret (at least 32 characters):

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for the next step.

## Step 3: Configure Environment Variables

Update your `.env.local` file:

```env
# Stack Auth Data Vault Configuration
STACK_DATA_VAULT_SECRET=<paste-your-generated-secret-here>

# Data Vault Store ID (must match what you created in Step 1)
STACK_DATA_VAULT_STORE_ID=creditcard-info
```

**IMPORTANT:**
- The `STACK_DATA_VAULT_SECRET` is used for encryption/decryption
- Keep this secret safe - even Stack Auth cannot access your data without it
- If you lose this secret, you won't be able to decrypt your stored data
- The `STACK_DATA_VAULT_STORE_ID` must match the store ID you created in the dashboard

## Step 4: Verify Setup

1. Restart your Next.js development server:
```bash
npm run dev
```

2. Navigate to the Tasks page (`/tasks`)
3. Click the **Payment Settings** button
4. Try entering and saving credit card information
5. If successful, the data is encrypted and stored in your Data Vault

## Troubleshooting

### Error: "Data vault store does not exist"

This means the store hasn't been created in your Stack Auth dashboard, or the store ID doesn't match.

**Solution:**
1. Verify the store exists in your Stack Auth dashboard
2. Check that `STACK_DATA_VAULT_STORE_ID` in `.env.local` matches the store ID in your dashboard
3. Restart your dev server after changing environment variables

### Error: "Data Vault is not configured"

The `STACK_DATA_VAULT_SECRET` environment variable is missing or empty.

**Solution:**
1. Generate a secret using `openssl rand -base64 32`
2. Add it to `.env.local` as `STACK_DATA_VAULT_SECRET`
3. Restart your dev server

## Security Notes

- Never commit `.env.local` to version control
- The vault secret provides access to decrypt your data
- Store the secret securely (password manager, secrets management system)
- Use different secrets for development and production environments
- Credit card data is encrypted using envelope encryption with a rotating master key
- Neither Stack Auth nor anyone without the vault secret can access the plaintext data

## How It Works

1. User enters credit card info in the Payment Settings dialog
2. Frontend sends data to `/api/creditcard/store`
3. Backend fetches the Data Vault store using the store ID
4. Data is encrypted using the vault secret
5. Encrypted data is stored with the user's ID as the key
6. When retrieving, the process is reversed to decrypt the data

## Browser-Use Integration

The browser-use backend automatically fetches credit card data when processing applications:

```python
# In browser-use/main.py
credit_card = fetch_credit_card_from_vault(user_id)
# Returns: {"cardNumber": "...", "cardholderName": "...", "expiryDate": "...", "cvv": "..."}
```

Make sure to set `NEXT_APP_API_URL` in `browser-use/.env`:
```env
NEXT_APP_API_URL=http://localhost:3000
```
