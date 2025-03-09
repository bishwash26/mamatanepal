// Create a mock API handler
const initiatePayment = () => {
  return new Response(
    JSON.stringify({
      success: true,
      paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
      formData: {
        // Mock data
        amount: "100",
        tax_amount: "0",
        total_amount: "100",
        transaction_uuid: "mock-uuid",
        product_code: "EPAYTEST",
        product_service_charge: "0",
        product_delivery_charge: "0",
        success_url: `${window.location.origin}/success?method=esewa`,
        failure_url: `${window.location.origin}`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: "mock-signature",
      }
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};

// Add this to your application's initialization
if (import.meta.env.DEV) {
  window.fetch = async (input, init) => {
    if (input === '/api/initiate-payment') {
      return initiatePayment();
    }
    return originalFetch(input, init);
  };
} 