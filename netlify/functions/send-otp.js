const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { phone } = JSON.parse(event.body);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP temporarily
  globalThis.otpStore = globalThis.otpStore || {};
  globalThis.otpStore[phone] = otp;

  const message = `Your OTP for verification is ${otp}`;
  const fast2smsURL = "https://www.fast2sms.com/dev/bulkV2";

  const response = await fetch(fast2smsURL, {
    method: "POST",
    headers: {
      "authorization": process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      route: "q",
      message,
      language: "english",
      numbers: phone
    })
  });

  const data = await response.json();

  if (data.return) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: data.message })
    };
  }
};
