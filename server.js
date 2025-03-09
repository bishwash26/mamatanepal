const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const esewaRoutes = require('./src/server/esewa');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/esewa', esewaRoutes);

// Add this near your other routes
app.post('/api/initiate-payment', async (req, res) => {
  try {
    const { amount, productName, transactionId, method } = req.body;
    
    if (!amount || !productName || !transactionId || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (method === 'esewa') {
      const transactionUuid = `${Date.now()}-${uuidv4()}`;
      
      // You'll need to implement generateEsewaSignature in server.js or import it
      const signatureString = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${process.env.ESEWA_MERCHANT_CODE}`;
      const signature = generateEsewaSignature(process.env.ESEWA_SECRET_KEY, signatureString);
      
      return res.json({
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
          success_url: `${process.env.FRONTEND_URL}/success?method=esewa`,
          failure_url: `${process.env.FRONTEND_URL}`,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: signature,
        }
      });
    }
    
    // Handle other payment methods...
    
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('eSewa Payment API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 