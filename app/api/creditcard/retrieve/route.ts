import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to retrieve credit card information" },
        { status: 401 }
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

      // Retrieve the credit card data using the user's ID as the key
      const creditCardData = await store.getValue(user.id, {
        secret: vaultSecret,
      });

      if (!creditCardData) {
        return NextResponse.json(
          { creditCard: null, message: "No credit card information found" },
          { status: 200 }
        );
      }

      const parsedData = JSON.parse(creditCardData);

      return NextResponse.json(
        { creditCard: parsedData },
        { status: 200 }
      );
    } catch (storeError: any) {
      console.error("Data Vault store error:", storeError);

      // Check if it's a "store does not exist" error
      if (storeError?.message?.includes("does not exist") || storeError?.statusCode === 400) {
        return NextResponse.json(
          {
            error: "Data Vault Not Configured",
            message: `Data Vault store "${storeId}" does not exist. Please create it in your Stack Auth dashboard first.`,
          },
          { status: 400 }
        );
      }

      throw storeError;
    }

  } catch (error) {
    console.error("Error retrieving credit card:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Failed to retrieve credit card information",
      },
      { status: 500 }
    );
  }
}
