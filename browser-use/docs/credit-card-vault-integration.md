# Credit Card Data Vault Integration

This document explains how browser-use retrieves encrypted credit card information from the Next.js backend's Stack Auth Data Vault.

## Overview

The browser-use automation tool fetches credit card data stored securely in Stack Auth's Data Vault to automatically fill payment information during the college application process. This integration ensures sensitive payment data is never stored in plaintext and remains encrypted end-to-end.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│   Browser-Use   │────────▶│  Next.js API     │────────▶│  Stack Auth      │
│   (Python)      │         │  /api/creditcard │         │  Data Vault      │
│                 │◀────────│  /get-for-user   │◀────────│  (Encrypted)     │
└─────────────────┘         └──────────────────┘         └──────────────────┘
```

1. Browser-use sends user ID to Next.js API
2. Next.js API fetches encrypted data from Stack Auth Data Vault
3. Data is decrypted using the vault secret
4. Decrypted credit card info is returned to browser-use
5. Browser-use uses the data to fill payment forms

## Prerequisites

### Environment Variables

Create or update your `.env` file in the `browser-use` directory:

```env
# Next.js API URL
# For local development
NEXT_APP_API_URL=http://localhost:3000

# For production
# NEXT_APP_API_URL=https://your-domain.com

# OpenAI API key for browser automation
OPENAI_API_KEY=your-openai-api-key

# CommonApp password
COMMONAPP_PASSWORD=your-password
```

### Next.js Backend Setup

Ensure the Next.js backend is running with:
- Stack Auth Data Vault configured
- `STACK_DATA_VAULT_SECRET` set in `.env.local`
- `STACK_DATA_VAULT_STORE_ID` matching your created store (e.g., `payment-info`)

## How It Works

### Function: `fetch_credit_card_from_vault()`

Located in `main.py`, this function retrieves credit card data from the Data Vault.

```python
def fetch_credit_card_from_vault(user_id: str) -> dict | None:
    """
    Fetch credit card information from Stack Auth Data Vault via API.

    Args:
        user_id: The Stack Auth user ID

    Returns:
        Dictionary with credit card info or None if not found/error
    """
    try:
        api_url = os.environ.get("NEXT_APP_API_URL", "http://localhost:3000")
        response = requests.post(
            f"{api_url}/api/creditcard/get-for-user",
            json={"userId": user_id},
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            return data.get("creditCard")
        else:
            print(f"Failed to fetch credit card: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching credit card from vault: {e}")
        return None
```

### Integration in Workflow

The function is called automatically when parsing applicant data:

```python
def parse_applicant_json(data_path: str) -> dict:
    """Parse applicant data from JSON file sent by the API."""
    import json

    with open(data_path, 'r') as f:
        data = json.load(f)

    # Fetch credit card information from Stack Auth Data Vault
    user_id = data.get("user_id", "")
    credit_card = fetch_credit_card_from_vault(user_id) if user_id else None

    # Map the JSON data to the expected format
    context_info = {
        # ... other fields ...
        "credit_card": credit_card,  # Added to context
        # ... rest of data ...
    }

    return context_info
```

## API Endpoint

### Request

**Endpoint**: `POST /api/creditcard/get-for-user`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "userId": "user-stack-auth-id-here"
}
```

### Response

**Success (200)**:
```json
{
  "creditCard": {
    "cardNumber": "1234 5678 9012 3456",
    "cardholderName": "John Doe",
    "expiryDate": "12/26",
    "cvv": "123"
  }
}
```

**Not Found (200)**:
```json
{
  "creditCard": null,
  "message": "No credit card information found for this user"
}
```

**Error (400)**:
```json
{
  "error": "Data Vault Not Configured",
  "message": "Data Vault store \"payment-info\" does not exist. Please create it in your Stack Auth dashboard first."
}
```

**Error (500)**:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to retrieve credit card information"
}
```

## Data Structure

The returned credit card object contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `cardNumber` | string | Full credit card number with spaces | `"1234 5678 9012 3456"` |
| `cardholderName` | string | Name as it appears on the card | `"John Doe"` |
| `expiryDate` | string | Expiration date in MM/YY format | `"12/26"` |
| `cvv` | string | Card verification value (3-4 digits) | `"123"` |

## Usage in Browser Automation

Once fetched, the credit card data is available in the `context_info` dictionary:

```python
async def fill_common_app(context_info: dict):
    # Credit card info is available here
    credit_card = context_info.get('credit_card')

    if credit_card:
        card_number = credit_card['cardNumber']
        cardholder_name = credit_card['cardholderName']
        expiry_date = credit_card['expiryDate']
        cvv = credit_card['cvv']

        # Use in your automation task
        task = f"""
        Fill payment form with:
        - Card Number: {card_number}
        - Cardholder: {cardholder_name}
        - Expiry: {expiry_date}
        - CVV: {cvv}
        """
    else:
        print("No credit card information available")
```

## Error Handling

The function handles errors gracefully:

1. **Missing Environment Variable**: Falls back to `http://localhost:3000`
2. **Network Errors**: Catches exceptions and returns `None`
3. **API Errors**: Prints status code and returns `None`
4. **No Data**: Returns `None` if user hasn't saved credit card info

When `credit_card` is `None` in `context_info`, the automation should skip payment-related steps.

## Troubleshooting

### Error: Connection refused

**Cause**: Next.js backend is not running or wrong URL

**Solution**:
```bash
# Start Next.js dev server
cd /path/to/nextjs-app
npm run dev

# Verify it's running on port 3000
curl http://localhost:3000
```

### Error: No credit card information found

**Cause**: User hasn't saved credit card data in the dashboard

**Solution**:
1. Navigate to `/tasks` in the Next.js app
2. Click "Payment Settings" button
3. Enter and save credit card information
4. Run browser-use automation again

### Error: Data Vault store does not exist

**Cause**: Mismatch between store ID in environment variables

**Solution**:
1. Check `STACK_DATA_VAULT_STORE_ID` in Next.js `.env.local`
2. Verify it matches the store created in Stack Auth dashboard
3. Restart Next.js dev server after changes

### Error: Invalid user_id

**Cause**: The `user_id` field is missing from applicant JSON data

**Solution**:
Ensure your `applicant_data.json` includes the Stack Auth user ID:
```json
{
  "user_id": "the-stack-auth-user-id",
  "email": "user@example.com",
  // ... other fields
}
```

## Security Considerations

1. **Encryption in Transit**: All API calls use HTTPS in production
2. **No Storage**: Credit card data is never stored in browser-use
3. **Memory Only**: Data exists only in memory during automation
4. **Vault Secret**: The decryption secret never leaves the Next.js backend
5. **Environment Variables**: Sensitive config is in `.env` (not committed to git)

## Testing

### Test the API Endpoint

```bash
# Test from command line
curl -X POST http://localhost:3000/api/creditcard/get-for-user \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-user-id-here"}'
```

### Test in Python

```python
import os
import requests

# Set environment variable
os.environ['NEXT_APP_API_URL'] = 'http://localhost:3000'

# Test the function
from main import fetch_credit_card_from_vault

user_id = "your-stack-auth-user-id"
credit_card = fetch_credit_card_from_vault(user_id)

if credit_card:
    print("✓ Credit card fetched successfully")
    print(f"  Cardholder: {credit_card['cardholderName']}")
    print(f"  Card: {credit_card['cardNumber']}")
else:
    print("✗ Failed to fetch credit card")
```

## Production Deployment

When deploying to production:

1. Update `NEXT_APP_API_URL` in production environment:
   ```env
   NEXT_APP_API_URL=https://your-production-domain.com
   ```

2. Ensure Next.js production deployment has:
   - `STACK_DATA_VAULT_SECRET` configured
   - `STACK_DATA_VAULT_STORE_ID` set correctly
   - Data Vault store created in production Stack Auth project

3. Use HTTPS for all API communication

4. Consider implementing additional authentication for the API endpoint

## Related Documentation

- [Stack Auth Data Vault Setup Guide](../../docs/data-vault-setup.md)
- [Next.js API Routes](../../app/api/creditcard/)
- [Browser-Use Main Script](../main.py)
