const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { name, phone, otp } = JSON.parse(event.body);

  globalThis.otpStore = globalThis.otpStore || {};
  const storedOtp = globalThis.otpStore[phone];

  if (storedOtp !== otp) {
    return {
      statusCode: 401,
      body: JSON.stringify({ verified: false })
    };
  }

  delete globalThis.otpStore[phone]; // clear once used

  const message = `New member joined:\nName: ${name}\nPhone: ${phone}`;
  const adminPhone = process.env.ADMIN_PHONE;
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
      numbers: adminPhone
    })
  });

  const data = await response.json();

  if (data.return) {
    return {
      statusCode: 200,
      body: JSON.stringify({ verified: true })
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ verified: false, error: data.message })
    };
  }
};
