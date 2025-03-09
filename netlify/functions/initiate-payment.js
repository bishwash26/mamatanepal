const crypto = require('crypto');

// Helper function to generate eSewa signature
function generateEsewaSignature(secretKey, signatureString) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(signatureString)
    .digest('base64');
}

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amount, productName, transactionId, method } = JSON.parse(event.body);
    
    if (!amount || !productName || !transactionId || !method) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    if (method === 'esewa') {
      const transactionUuid = `${Date.now()}-${transactionId}`;
      
      const signatureString = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${process.env.ESEWA_MERCHANT_CODE}`;
      const signature = generateEsewaSignature(process.env.ESEWA_SECRET_KEY, signatureString);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
          formData: {
            amount: amount,
            tax_amount: "0",
            total_amount: amount,
            transaction_uuid: transactionUuid,
            product_code: process.env.ESEWA_MERCHANT_CODE,
            product_service_charge: "0",
            product_delivery_charge: "0",
            success_url: `${process.env.URL}/success?method=esewa`,
            failure_url: `${process.env.URL}`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature,
          }
        })
      };
    }
    
    // Handle other payment methods if needed
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Unsupported payment method' })
    };
    
  } catch (error) {
    console.error('Payment error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 