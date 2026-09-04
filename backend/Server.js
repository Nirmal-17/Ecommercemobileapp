const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const PORT = process.env.PORT || 5000;

// ============================================================
// eSewa Configuration
// ============================================================

const ESEWA_PRODUCT_CODE =
  process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';

const ESEWA_SECRET_KEY =
  process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

// UAT / Testing
const ESEWA_PAYMENT_URL =
  'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

// Transaction status API
// Transaction status API
const ESEWA_STATUS_URL =
  'https://uat.esewa.com.np/api/epay/transaction/status/';

// ============================================================
// Generate HMAC SHA256 Base64 Signature
// ============================================================

function generateSignature(message) {
  return crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
}

// ============================================================
// Health Check
// ============================================================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'eSewa payment backend is running',
  });
});

// ============================================================
// CREATE ESEWA PAYMENT
// ============================================================

app.post('/api/esewa/create-payment', (req, res) => {
  try {
    const {
      amount,
      delivery_charge,
      total_amount,
      transaction_uuid,
    } = req.body;

    console.log('\n========== CREATE ESEWA PAYMENT ==========');
    console.log('Amount:', amount);
    console.log('Delivery:', delivery_charge);
    console.log('Total:', total_amount);
    console.log('Transaction UUID:', transaction_uuid);

    // ----------------------------------------------------------
    // Validate request
    // ----------------------------------------------------------

    if (
      amount === undefined ||
      total_amount === undefined ||
      !transaction_uuid
    ) {
      return res.status(400).json({
        success: false,
        message:
          'amount, total_amount and transaction_uuid are required',
      });
    }

    const productAmount = Number(amount);
    const deliveryCharge = Number(delivery_charge || 0);
    const totalAmount = Number(total_amount);

    if (
      !Number.isFinite(productAmount) ||
      !Number.isFinite(deliveryCharge) ||
      !Number.isFinite(totalAmount)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount',
      });
    }

    // eSewa requires:
    //
    // total_amount =
    // amount + tax_amount +
    // product_service_charge +
    // product_delivery_charge

    const taxAmount = 0;
    const serviceCharge = 0;

    const calculatedTotal =
      productAmount +
      taxAmount +
      serviceCharge +
      deliveryCharge;

    // Compare using 2 decimal places
    if (
      Number(calculatedTotal.toFixed(2)) !==
      Number(totalAmount.toFixed(2))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount calculation mismatch',
        calculatedTotal,
        receivedTotal: totalAmount,
      });
    }

    // eSewa transaction_uuid supports
    // alphanumeric characters and hyphens.
    const cleanTransactionUUID = String(transaction_uuid);

    if (!/^[a-zA-Z0-9-]+$/.test(cleanTransactionUUID)) {
      return res.status(400).json({
        success: false,
        message:
          'Invalid transaction_uuid. Use only letters, numbers and hyphens.',
      });
    }

    // ----------------------------------------------------------
    // Signature
    // ----------------------------------------------------------

    const signedFieldNames =
      'total_amount,transaction_uuid,product_code';

    const signatureMessage =
      `total_amount=${totalAmount.toFixed(2)},` +
      `transaction_uuid=${cleanTransactionUUID},` +
      `product_code=${ESEWA_PRODUCT_CODE}`;

    const signature =
      generateSignature(signatureMessage);

    console.log('Signature message:', signatureMessage);
    console.log('Signature:', signature);

    // ----------------------------------------------------------
    // URLs
    // ----------------------------------------------------------

    // IMPORTANT:
    // These URLs are handled by your backend.
    //
    // eSewa redirects the user here after payment.

    const successUrl =
      `http://10.0.2.2:${PORT}/api/esewa/success`;

    const failureUrl =
      `http://10.0.2.2:${PORT}/api/esewa/failure`;

    // ----------------------------------------------------------
    // Payment data
    // ----------------------------------------------------------

    const paymentData = {
      amount: productAmount.toFixed(2),
      tax_amount: taxAmount.toFixed(2),
      total_amount: totalAmount.toFixed(2),

      transaction_uuid: cleanTransactionUUID,

      product_code: ESEWA_PRODUCT_CODE,

      product_service_charge:
        serviceCharge.toFixed(2),

      product_delivery_charge:
        deliveryCharge.toFixed(2),

      success_url: successUrl,

      failure_url: failureUrl,

      signed_field_names: signedFieldNames,

      signature,
    };

    console.log('Payment data:', paymentData);
    console.log('==========================================\n');

    return res.json({
      success: true,
      paymentUrl: ESEWA_PAYMENT_URL,
      paymentData,
    });

  } catch (error) {
    console.error(
      'Create payment error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message: 'Failed to create eSewa payment',
    });
  }
});

// ============================================================
// ESEWA SUCCESS REDIRECT
// ============================================================

app.get('/api/esewa/success', (req, res) => {
  console.log('\n========== ESEWA SUCCESS ==========');
  console.log('Query:', req.query);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
      </head>

      <body style="
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
      ">

        <h1 style="color: #16a34a;">
          Payment Successful
        </h1>

        <p>
          Your eSewa payment was successful.
        </p>

        <p>
          You can return to the application.
        </p>

      </body>
    </html>
  `);
});

// ============================================================
// ESEWA FAILURE REDIRECT
// ============================================================

app.get('/api/esewa/failure', (req, res) => {
  console.log('\n========== ESEWA FAILURE ==========');
  console.log('Query:', req.query);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport"
              content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
      </head>

      <body style="
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 50px;
      ">

        <h1 style="color: #dc2626;">
          Payment Failed
        </h1>

        <p>
          The eSewa transaction was cancelled or failed.
        </p>

        <p>
          You can return to the application.
        </p>

      </body>
    </html>
  `);
});

// ============================================================
// VERIFY ESEWA PAYMENT
// ============================================================

app.post('/api/esewa/verify-payment', async (req, res) => {
  try {
    const {
      encodedData,
      transaction_uuid,
      total_amount,
    } = req.body;

    console.log('\n========== VERIFY ESEWA PAYMENT ==========');
    console.log('Transaction UUID:', transaction_uuid);
    console.log('Total:', total_amount);

    if (!transaction_uuid || !total_amount) {
      return res.status(400).json({
        success: false,
        message:
          'transaction_uuid and total_amount are required',
      });
    }

    // ----------------------------------------------------------
    // Decode eSewa response
    // ----------------------------------------------------------

    let decodedData = null;

    if (encodedData) {
      try {
        const decodedString =
          Buffer.from(
            encodedData,
            'base64',
          ).toString('utf8');

        decodedData =
          JSON.parse(decodedString);

        console.log(
          'Decoded eSewa response:',
          decodedData,
        );

      } catch (decodeError) {
        console.error(
          'Could not decode eSewa response:',
          decodeError,
        );
      }
    }

    // ----------------------------------------------------------
    // Basic response validation
    // ----------------------------------------------------------

    if (
      decodedData &&
      decodedData.transaction_uuid &&
      decodedData.transaction_uuid !== transaction_uuid
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Transaction UUID does not match',
      });
    }

    if (
      decodedData &&
      decodedData.product_code &&
      decodedData.product_code !== ESEWA_PRODUCT_CODE
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Product code does not match',
      });
    }

    // ----------------------------------------------------------
    // Verify response signature when available
    // ----------------------------------------------------------

    if (
      decodedData &&
      decodedData.signature &&
      decodedData.signed_field_names
    ) {
      const fields =
        decodedData.signed_field_names.split(',');

      const signatureMessage = fields
        .map(
          field =>
            `${field}=${decodedData[field]}`,
        )
        .join(',');

      const expectedSignature =
        generateSignature(signatureMessage);

      if (
        expectedSignature !==
        decodedData.signature
      ) {
        console.error(
          'eSewa response signature mismatch',
        );

        return res.status(400).json({
          success: false,
          message:
            'Invalid eSewa response signature',
        });
      }

      console.log(
        'eSewa response signature verified.',
      );
    }

    // ----------------------------------------------------------
    // Transaction Status API
    // ----------------------------------------------------------

    const params = new URLSearchParams({
      product_code:
        ESEWA_PRODUCT_CODE,

      total_amount:
        Number(total_amount).toFixed(2),

      transaction_uuid:
        String(transaction_uuid),
    });

    const statusUrl =
      `${ESEWA_STATUS_URL}?${params.toString()}`;

    console.log(
      'Checking eSewa transaction:',
      statusUrl,
    );

    const response =
      await fetch(statusUrl);

    if (!response.ok) {
      throw new Error(
        `eSewa status API returned ${response.status}`,
      );
    }

    const statusData =
      await response.json();

    console.log(
      'eSewa status response:',
      statusData,
    );

    // ----------------------------------------------------------
    // COMPLETE = payment successful
    // ----------------------------------------------------------

    if (
      statusData.status === 'COMPLETE'
    ) {
      return res.json({
        success: true,

        message:
          'eSewa payment verified successfully',

        transactionId:
          statusData.ref_id ||
          decodedData?.transaction_code ||
          transaction_uuid,

        status:
          statusData.status,

        data: statusData,
      });
    }

    // ----------------------------------------------------------
    // Payment not complete
    // ----------------------------------------------------------

    return res.json({
      success: false,

      message:
        `eSewa payment status: ${
          statusData.status || 'UNKNOWN'
        }`,

      status:
        statusData.status,

      data: statusData,
    });

  } catch (error) {
    console.error(
      'Verify payment error:',
      error,
    );

    return res.status(500).json({
      success: false,
      message:
        'Unable to verify eSewa payment',
    });
  }
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('======================================');
  console.log(' eSewa Payment Backend');
  console.log('======================================');
  console.log(
    `Server running on port ${PORT}`,
  );
  console.log(
    `Local: http://localhost:${PORT}`,
  );
  console.log(
    `Android Emulator: http://10.0.2.2:${PORT}`,
  );
  console.log('======================================');
  console.log('');
});
