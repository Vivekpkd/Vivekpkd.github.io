---
title: Bitwise Calculator
layout: page
permalink: /apps/bitwise-calculator/
---

{% raw %}
<style>
  .bitwise-app {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: #0f172a;
    color: #e5e7eb;
    padding: 20px;
    max-width: 420px;
    margin: auto;
    border-radius: 12px;
    border: 1px solid #1e293b;
  }

  .bitwise-app h2 {
    text-align: center;
    margin-bottom: 20px;
  }

  .bitwise-app label {
    font-size: 14px;
    margin-top: 12px;
    display: block;
    color: #cbd5f5;
  }

  .bitwise-app input,
  .bitwise-app select,
  .bitwise-app button {
    width: 100%;
    padding: 10px;
    margin-top: 6px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
  }

  .bitwise-app input,
  .bitwise-app select {
    background: #020617;
    color: #e5e7eb;
    border: 1px solid #1e293b;
  }

  .bitwise-app button {
    background: #22c55e;
    color: #022c22;
    font-weight: 700;
    cursor: pointer;
    margin-top: 16px;
  }

  .bitwise-app button:hover {
    background: #16a34a;
  }

  .result {
    margin-top: 20px;
    padding: 14px;
    background: #020617;
    border-radius: 10px;
    border: 1px solid #1e293b;
    font-family: monospace;
    line-height: 1.6;
  }

  .result span {
    color: #22c55e;
  }
</style>

<div class="bitwise-app">
  <h2>🧮 Bitwise Calculator</h2>

  <label>Value A (Decimal)</label>
  <input type="number" id="a" value="5">

  <label>Value B (Decimal)</label>
  <input type="number" id="b" value="3">

  <label>Operation</label>
  <select id="op">
    <option value="&">& AND</option>
    <option value="|">| OR</option>
    <option value="^">^ XOR</option>
    <option value="<<"><< LEFT SHIFT (A << B)</option>
    <option value=">>">>> RIGHT SHIFT (A >> B)</option>
  </select>

  <button onclick="calculate()">Calculate</button>

  <div class="result" id="result">
    Waiting for input…
  </div>
</div>

<script>
  function calculate() {
    const a = parseInt(document.getElementById("a").value);
    const b = parseInt(document.getElementById("b").value);
    const op = document.getElementById("op").value;

    if (isNaN(a) || isNaN(b)) {
      document.getElementById("result").innerText = "Invalid input";
      return;
    }

    let r;
    switch (op) {
      case "&": r = a & b; break;
      case "|": r = a | b; break;
      case "^": r = a ^ b; break;
      case "<<": r = a << b; break;
      case ">>": r = a >> b; break;
    }

    document.getElementById("result").innerHTML = `
      <div>Decimal: <span>${r}</span></div>
      <div>Binary : <span>${r.toString(2)}</span></div>
      <div>Hex    : <span>0x${r.toString(16).toUpperCase()}</span></div>
    `;
  }
</script>
{% endraw %}
