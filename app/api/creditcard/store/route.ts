import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to store credit card information" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cardNumber, cardholderName, expiryDate, cvv } = body;

    if (!cardNumber || !cardholderName || !expiryDate || !cvv) {
      return NextResponse.json(
        { error: "Validation Error", message: "All credit card fields are required" },
        { status: 400 }
      );
    }

    const vaultSecret = process.env.STACK_DATA_VAULT_SECRET;
    if (!vaultSecret) {
      console.error("STACK_DATA_VAULT_SECRET is not configured");
      return NextResponse.json(
        { error: "Configuration Error", message: "Data Vault is not configured" },
        { status: 500 }
      );
    }

    // Get store ID from env or use default
    const storeId = process.env.STACK_DATA_VAULT_STORE_ID || "creditcard-info";

    try {
      // Get the Data Vault store for credit card info
      const store = await stackServerApp.getDataVaultStore(storeId);

      // Store the credit card data using the user's ID as the key
      const creditCardData = JSON.stringify({
        cardNumber,
        cardholderName,
        expiryDate,
        cvv,
      });

      await store.setValue(user.id, creditCardData, {
        secret: vaultSecret,
      });
    } catch (storeError: any) {
      console.error("Data Vault store error:", storeError);

      // Check if it's a "store does not exist" error
      if (storeError?.message?.includes("does not exist") || storeError?.statusCode === 400) {
        return NextResponse.json(
          {
            error: "Data Vault Not Configured",
            message: `Data Vault store "${storeId}" does not exist. Please create it in your Stack Auth dashboard first. Visit https://app.stack-auth.com/ and create a Data Vault store with ID "${storeId}".`,
          },
          { status: 400 }
        );
      }

      throw storeError;
    }

    return NextResponse.json(
      { success: true, message: "Credit card information stored securely" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error storing credit card:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to store credit card information",
      },
      { status: 500 }
    );
  }
}
