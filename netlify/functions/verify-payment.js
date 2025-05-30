// verify-payment.js
const crypto = require("crypto");

exports.handler = async (event) => {
  const { order_id, payment_id, signature } = JSON.parse(event.body);

  const secret = process.env.RAZORPAY_SECRET;

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (generatedSignature === signature) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ success: false }),
  };
};
