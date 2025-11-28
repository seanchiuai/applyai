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

    // Get the Data Vault store for credit card info
    const store = await stackServerApp.getDataVaultStore("creditcard-info");

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
