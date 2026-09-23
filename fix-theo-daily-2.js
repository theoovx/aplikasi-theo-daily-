// fix-theo-daily-2.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const base = path.join(os.homedir(), 'theo-daily');
const jsPath = path.join(base, 'js', 'app.js');
const htmlPath = path.join(base, 'index.html');

function applyPatches(filePath, patches) {
  let content = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath + '.backup2-' + Date.now(), content);

  for (const [label, oldStr, newStr] of patches) {
    const count = content.split(oldStr).length - 1;
    if (count !== 1) {
      console.log(`[SKIP] ${label}: ditemukan ${count}x (butuh tepat 1x)`);
      continue;
    }
    content = content.replace(oldStr, newStr);
    console.log(`[OK] ${label}`);
  }

  fs.writeFileSync(filePath, content);
}

console.log('--- Patching app.js ---');
applyPatches(jsPath, [
  ["defaultData tambah transactions", "  habits: [],\n  goals: [],\n\n  theme: \"paper\"\n};", "  habits: [],\n  goals: [],\n  transactions: [],\n\n  theme: \"paper\"\n};"],
  ["loadData merge tambah transactions", "      habits: Array.isArray(parsed.habits)\n        ? parsed.habits\n        : [],\n      goals: Array.isArray(parsed.goals)\n        ? parsed.goals\n        : []\n    };", "      habits: Array.isArray(parsed.habits)\n        ? parsed.habits\n        : [],\n      goals: Array.isArray(parsed.goals)\n        ? parsed.goals\n        : [],\n      transactions: Array.isArray(parsed.transactions)\n        ? parsed.transactions\n        : []\n    };"],
  ["tambah fitur Money lengkap", "/* =========================================================\n   DAILY REVIEW\n========================================================= */", "/* =========================================================\n   MONEY\n========================================================= */\n\nfunction formatRupiah(amount) {\n\n  const value =\n    Math.round(Number(amount) || 0);\n\n  return \"Rp\" + value.toLocaleString(\"id-ID\");\n\n}\n\nfunction getMoneyBalance() {\n\n  return data.transactions.reduce(\n    (sum, trx) =>\n      trx.type === \"income\"\n        ? sum + trx.amount\n        : sum - trx.amount,\n    0\n  );\n\n}\n\nfunction renderMoney() {\n\n  const balanceEl =\n    document.getElementById(\"moneyBalance\");\n\n  const listEl =\n    document.getElementById(\"moneyTransactionList\");\n\n  if (balanceEl) {\n    balanceEl.textContent =\n      formatRupiah(getMoneyBalance());\n  }\n\n  if (!listEl) {\n    return;\n  }\n\n  if (data.transactions.length === 0) {\n\n    listEl.innerHTML = `\n      <div class=\"empty-state\">\n        <div>Rp</div>\n        <p>No transactions yet.</p>\n        <span>Your money activity will appear here.</span>\n      </div>\n    `;\n\n    return;\n  }\n\n  const sorted =\n    [...data.transactions].sort(\n      (a, b) => b.id - a.id\n    );\n\n  listEl.innerHTML =\n    sorted.map(trx => `\n      <div class=\"schedule-item task-item\" data-trx-id=\"${trx.id}\">\n\n        <span class=\"task-check\">\n          ${trx.type === \"income\" ? \"+\" : \"\u2212\"}\n        </span>\n\n        <div class=\"task-info\">\n          <strong>${escapeHTML(trx.title)}</strong>\n          <small>${trx.type === \"income\" ? \"Income\" : \"Expense\"} \u2022 ${formatRupiah(trx.amount)} \u2022 ${trx.date}</small>\n        </div>\n\n        <button class=\"schedule-delete\" data-trx-delete=\"${trx.id}\" type=\"button\">\u00d7</button>\n\n      </div>\n    `).join(\"\");\n\n  listEl.querySelectorAll(\"[data-trx-delete]\").forEach(button => {\n    button.addEventListener(\"click\", () => {\n      deleteTransaction(Number(button.dataset.trxDelete));\n    });\n  });\n\n}\n\nfunction deleteTransaction(id) {\n\n  data.transactions =\n    data.transactions.filter(\n      trx => trx.id !== id\n    );\n\n  saveData();\n  renderMoney();\n\n}\n\nfunction addTransaction(type) {\n\n  const title =\n    prompt(\n      type === \"income\"\n        ? \"Sumber pemasukan:\"\n        : \"Untuk apa pengeluaran ini:\"\n    );\n\n  if (!title || !title.trim()) {\n    return;\n  }\n\n  const amountInput =\n    prompt(\"Jumlah (Rp):\");\n\n  const amount =\n    Number(amountInput);\n\n  if (!amountInput || isNaN(amount) || amount <= 0) {\n    alert(\"Jumlah tidak valid.\");\n    return;\n  }\n\n  data.transactions.push({\n    id: Date.now(),\n    type,\n    title: title.trim(),\n    amount,\n    date: getLocalDateKey()\n  });\n\n  saveData();\n  renderMoney();\n\n}\n\nfunction setupMoney() {\n\n  const incomeButton =\n    document.getElementById(\"addIncome\");\n\n  const expenseButton =\n    document.getElementById(\"addExpense\");\n\n  if (incomeButton) {\n    incomeButton.addEventListener(\n      \"click\",\n      () => addTransaction(\"income\")\n    );\n  }\n\n  if (expenseButton) {\n    expenseButton.addEventListener(\n      \"click\",\n      () => addTransaction(\"expense\")\n    );\n  }\n\n}\n\n\n/* =========================================================\n   DAILY REVIEW\n========================================================= */"],
  ["setupNavigation panggil renderMoney", "      if (page === \"focus\") suggestActivity();\n      if (page === \"review\") setupReview();", "      if (page === \"money\") renderMoney();\n      if (page === \"focus\") suggestActivity();\n      if (page === \"review\") setupReview();"],
  ["init() panggil setupMoney + renderMoney", "  setupNotifications();\n  checkReminders();\n  setupReview();", "  setupNotifications();\n  checkReminders();\n  setupMoney();\n  renderMoney();\n  setupReview();"],
  ["setupFocus konsisten ke semua minimum-day-trigger", "  const minimumButton =\n    document.getElementById(\"minimumDayButton\");\n\n  if (suggestButton) {\n    suggestButton.addEventListener(\n      \"click\",\n      suggestActivity\n    );\n  }\n\n  if (minimumButton) {\n    minimumButton.addEventListener(\n      \"click\",\n      startMinimumDay\n    );\n  }", "  if (suggestButton) {\n    suggestButton.addEventListener(\n      \"click\",\n      suggestActivity\n    );\n  }\n\n  document\n    .querySelectorAll(\".minimum-day-trigger\")\n    .forEach(button => {\n      button.addEventListener(\n        \"click\",\n        startMinimumDay\n      );\n    });"]
]);

console.log('');
console.log('--- Patching index.html ---');
applyPatches(htmlPath, [
  ["habitPage -> habitsPage", "id=\"habitPage\"", "id=\"habitsPage\""],
  ["bungkus transaction list dengan id moneyTransactionList", "          <div class=\"empty-state\">\n\n            <div>\n              Rp\n            </div>\n\n            <p>\n              No transactions yet.\n            </p>\n\n            <span>\n              Your money activity will appear here.\n            </span>\n\n          </div>\n\n        </section>\n\n\n      </main>\n\n    </section>\n\n\n\n    <!-- =====================================================\n         BOTTOM NAVIGATION\n    ====================================================== -->", "          <div id=\"moneyTransactionList\" class=\"task-list\">\n\n            <div class=\"empty-state\">\n\n              <div>\n                Rp\n              </div>\n\n              <p>\n                No transactions yet.\n              </p>\n\n              <span>\n                Your money activity will appear here.\n              </span>\n\n            </div>\n\n          </div>\n\n        </section>\n\n\n      </main>\n\n    </section>\n\n\n\n    <!-- =====================================================\n         BOTTOM NAVIGATION\n    ====================================================== -->"]
]);

console.log('');
console.log('Selesai. Backup asli disimpan sebagai *.backup2-<timestamp>.');
