const members = [
  "Ravi", "Sita", "Lakshmi", "Gopal", "Radha", "Amit", "Priya",
  "Kiran", "Meena", "Suraj", "Anita", "Dev", "Sunita", "Raj",
  "Pooja", "Nikhil", "Sneha", "Arjun", "Neha", "Vikram", "Extra 1", "Extra 2"
];
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
  "Aug", "Sep", "Oct", "Nov", "Dec"
];

const table = document.getElementById("contributionTable");

function buildTable() {
  let thead = `<thead><tr><th>Member</th>`;
  months.forEach(month => {
    thead += `<th>${month}</th>`;
  });
  thead += `<th>Pay</th></tr></thead>`;

  let tbody = `<tbody>`;
  members.forEach((name, rowIndex) => {
    tbody += `<tr><td>${name}<br><img class="member-photo" src="" alt="Photo" /></td>`;
    months.forEach(() => {
      tbody += `<td class="status-cell" data-row="${rowIndex}"></td>`;
    });
    tbody += `<td><button class="pay-btn" data-member="${rowIndex}">Pay</button></td></tr>`;
  });
  tbody += `</tbody>`;

  table.innerHTML = thead + tbody;
}

function restoreData() {
  members.forEach((_, memberIndex) => {
    const amountPaid = parseInt(localStorage.getItem(`paid_${memberIndex}`) || 0);
    const monthsPaid = Math.floor(amountPaid / 150);
    const cells = Array.from(
      table.querySelectorAll(`tr:nth-child(${memberIndex + 2}) .status-cell`)
    );
    cells.forEach((cell, i) => {
      cell.innerText = i < monthsPaid ? "₹150" : "";
      if (i < monthsPaid) cell.style.color = "green";
    });
  });
}

function updateMonthTotals() {
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `<td><strong>মাসিক মোট</strong></td>`;

  for (let col = 0; col < months.length; col++) {
    let total = 0;
    for (let row = 1; row <= members.length; row++) {
      const cell = table.querySelector(`tr:nth-child(${row + 1}) td.status-cell:nth-child(${col + 2})`);
      if (cell && cell.innerText === "₹150") {
        total += 150;
      }
    }
    totalRow.innerHTML += `<td><strong>₹${total}</strong></td>`;
  }

  totalRow.innerHTML += `<td></td>`;
  table.querySelector("tbody").appendChild(totalRow);
}

function setupPayButtons() {
  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const memberIndex = btn.dataset.member;
      const amount = prompt("Enter payment amount in ₹ (min ₹150):");
      if (!amount || parseInt(amount) < 150) {
        alert("Minimum ₹150 required");
        return;
      }

      const memberRow = parseInt(memberIndex) + 2;
      const allCells = Array.from(
        table.querySelectorAll(`tr:nth-child(${memberRow}) .status-cell`)
      );

      const previousAmount = parseInt(localStorage.getItem(`paid_${memberIndex}`) || 0);
      const newAmount = previousAmount + parseInt(amount);
      localStorage.setItem(`paid_${memberIndex}`, newAmount);

      allCells.forEach(cell => (cell.innerText = ""));
      const monthsToFill = Math.floor(newAmount / 150);
      allCells.slice(0, monthsToFill).forEach(cell => {
        cell.innerText = "₹150";
        cell.style.color = "green";
      });

      // ✅ Step 3: Send data to Google Sheets
      const contributionData = {
        member: members[memberIndex],
        amount: parseInt(amount),
        monthsPaid: monthsToFill,
        monthNames: months.slice(0, monthsToFill),
        timestamp: new Date().toISOString()
      };
      sendToGoogleSheets(contributionData);

      // Optional: redirect to confirmation page
      const order_id = `order_${Date.now()}`;
      const redirectUrl = `payment-success.html?order_id=${order_id}&amount=${amount}&member=${memberIndex}&months=${monthsToFill}`;
      window.location.href = redirectUrl;
    });
  });
}

// ✅ Google Sheets integration function
const webAppUrl = "https://script.google.com/macros/s/AKfycby5aMr9YVhHKi44wbeEy5egBQOaoqY9_ilXYbqWrUWGehz_3cIbQE0TqP64RXtMPToeGA/exec";

async function sendToGoogleSheets(data) {
  try {
    await fetch(webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    console.log("✅ Data sent to Google Sheets:", data);
  } catch (error) {
    console.error("❌ Error sending to Google Sheets:", error);
  }
}

// Initialize table on page load
buildTable();
restoreData();
updateMonthTotals();
setupPayButtons();
