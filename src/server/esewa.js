const express = require('express');
const router = express.Router();
const EsewaIntegration = require('esewa-integration-server');

// Initialize eSewa integration
const esewa = new EsewaIntegration({
  secretKey: process.env.ESEWA_SECRET_KEY || "your-esewa-secret-key", 
  successUrl: `${process.env.FRONTEND_URL}/payment/success`,
  failureUrl: `${process.env.FRONTEND_URL}/payment/failure`,
  sameSite: "strict",
  secure: "true",
});

// Initiate payment
router.post('/initiatePayment', async (req, res) => {
  try {
    const { total_amount, transactionUUID, amount, productCode } = req.body;
    
    esewa.initiatePayment(
      {
        total_amount,
        transactionUUID,
        amount,
        productCode,
        productDeliveryCharge: 0,
        productServiceCharge: 0,
        taxAmount: 0,
      },
      res
    );
  } catch (error) {
    console.error("Error initiating payment:", error.message);
    res.status(500).json({ error: "Failed to initiate payment." });
  }
});

// Handle payment success
router.get('/payment/success', esewa.processPaymentSuccess, async (req, res) => {
  try {
    const { transaction_uuid, amount } = req.params;
    
    console.log('Payment successful for transaction:', transaction_uuid);
    console.log('Amount paid:', amount);

    // Redirect to success page
    const redirectUrl = `${process.env.FRONTEND_URL}/order-confirmation`;
    const messageProps = {
      paymentSuccess: "Payment Successful!",
      thanks: "Thank you for your order!",
    };

    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment success:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Handle payment failure
router.get('/payment/failure', esewa.processPaymentFailure, async (req, res) => {
  try {
    console.log('Payment failed for transaction:', req.transactionUUID);
    
    // Redirect to failure page
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-failed`;
    const messageProps = {
      paymentFailed: "Payment Failed",
      sorry: "Sorry, your payment could not be processed.",
    };

    esewa.redirectToClientSite(res, redirectUrl, messageProps);
  } catch (error) {
    console.error("Error handling payment failure:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router; 