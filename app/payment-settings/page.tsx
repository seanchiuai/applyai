import CreditCardForm from "@/components/CreditCardForm";

export default function PaymentSettingsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <CreditCardForm />
      </div>
    </div>
  );
}
