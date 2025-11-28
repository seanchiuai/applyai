import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";

// This endpoint is designed to be called by the browser-use backend
// It accepts a userId parameter to retrieve credit card info for a specific user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Validation Error", message: "userId is required" },
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

    // Get the Data Vault store for credit card info
    const store = await stackServerApp.getDataVaultStore("creditcard-info");

    // Retrieve the credit card data using the provided userId as the key
    const creditCardData = await store.getValue(userId, {
      secret: vaultSecret,
    });

    if (!creditCardData) {
      return NextResponse.json(
        { creditCard: null, message: "No credit card information found for this user" },
        { status: 200 }
      );
    }

    const parsedData = JSON.parse(creditCardData);

    return NextResponse.json(
      { creditCard: parsedData },
      { status: 200 }
    );
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
