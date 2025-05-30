function sendOTP() {
  const otp = Math.floor(1000 + Math.random() * 9000);
  alert(`Simulated OTP: ${otp}`);
  localStorage.setItem("otp", otp);
  document.getElementById("otp").style.display = "block";
}
document.getElementById("joinForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const userOTP = document.getElementById("otp").value;
  if (userOTP === localStorage.getItem("otp")) {
    alert("Verification successful! Welcome.");
  } else {
    alert("Incorrect OTP");
  }
});