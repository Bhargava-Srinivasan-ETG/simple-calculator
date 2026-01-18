console.log("Calculator logs");

/* -------------------- STATE -------------------- */

let history = [];

let display = document.querySelector("#display-area");
let operatorDisplay = document.querySelector("#operator-display");

const historyPopup = document.querySelector("#history-popup");
const historyList = document.querySelector("#history-list");
const closeHistoryBtn = document.querySelector("#close-history");

let storedValue = null;
let currentOperator = null;
let lastAction = null;
let isError = false;

/* -------------------- HELPERS -------------------- */

function calculate(a, b, operator) {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? "ERR" : a / b;
    default:
      return b;
  }
}

const operatorMap = {
  "+": "+",
  "−": "-",
  "×": "*",
  "÷": "/",
};

const reverseOperatorMap = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

/* -------------------- MAIN HANDLER -------------------- */

document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const userInput = button.textContent.trim();

  /* -------- ERR LOCK -------- */
  if (isError && userInput !== "AC") return;

  /* -------- AC -------- */
  if (userInput === "AC") {
    display.value = "0";
    operatorDisplay.value = "";
    storedValue = null;
    currentOperator = null;
    lastAction = null;
    isError = false;
    return;
  }

  /* -------- C -------- */
  if (userInput === "C") {
    if (lastAction === "number") {
      display.value = "0";
      lastAction = null;
      return;
    }

    if (lastAction === "operator") {
      operatorDisplay.value = "";
      currentOperator = null;
      lastAction = "number";
      return;
    }

    if (lastAction === "equals") {
      display.value = "0";
      operatorDisplay.value = "";
      storedValue = null;
      currentOperator = null;
      lastAction = null;
      return;
    }
  }

  /* -------- HISTORY -------- */
  if (userInput === "H") {
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = "<div>No calculations yet</div>";
    } else {
      history.forEach((entry) => {
        const div = document.createElement("div");
        div.textContent = entry;
        historyList.appendChild(div);
      });
    }

    historyPopup.classList.remove("hidden");
    return;
  }

  /* -------- +/- -------- */
  if (userInput === "±") {
    if (display.value === "0") return;

    display.value = display.value.startsWith("-")
      ? display.value.slice(1)
      : "-" + display.value;

    lastAction = "number";
    return;
  }

  /* -------- DECIMAL -------- */
  if (userInput === ".") {
    if (
      lastAction === "operator" ||
      lastAction === "equals" ||
      display.value === "0"
    ) {
      display.value = "0.";
      operatorDisplay.value = "";
      lastAction = "number";
      return;
    }

    if (display.value.includes(".")) return;

    display.value += ".";
    lastAction = "number";
    return;
  }

  /* -------- DIGITS -------- */
  if (userInput >= "0" && userInput <= "9") {
    if (lastAction === "operator") {
      display.value = userInput;
      operatorDisplay.value = "";
      lastAction = "number";
      return;
    }

    if (display.value === "0") {
      display.value = userInput;
      lastAction = "number";
      return;
    }

    // decimal precision limit
    if (display.value.includes(".")) {
      const decimals = display.value.split(".")[1].length;
      if (decimals >= 3) return;
    }

    // 8-digit limit (excluding - and .)
    if (display.value.replace("-", "").replace(".", "").length < 8) {
      display.value += userInput;
      lastAction = "number";
    }
    return;
  }

  /* -------- OPERATORS -------- */
  if (userInput in operatorMap) {
    const newOperator = operatorMap[userInput];

    if (lastAction === "number" || lastAction === null) {
      storedValue = Number(display.value);
      currentOperator = newOperator;
      operatorDisplay.value = userInput;
      lastAction = "operator";
      return;
    }

    if (lastAction === "operator") {
      currentOperator = newOperator;
      operatorDisplay.value = userInput;
      return;
    }

    if (lastAction === "equals") {
      storedValue = Number(display.value);
      currentOperator = newOperator;
      operatorDisplay.value = userInput;
      lastAction = "operator";
      return;
    }
  }

  /* -------- EQUALS -------- */
  if (userInput === "=") {
    if (
      storedValue !== null &&
      currentOperator !== null &&
      lastAction === "number"
    ) {
      const currentValue = Number(display.value);
      const result = calculate(storedValue, currentValue, currentOperator);

      if (
        result === "ERR" ||
        String(Math.abs(result)).replace(".", "").length > 8
      ) {
        display.value = "ERR";
        operatorDisplay.value = "";
        storedValue = null;
        currentOperator = null;
        lastAction = "equals";
        isError = true;
        return;
      }

      // history only on successful calculation
      history.push(
        `${storedValue} ${reverseOperatorMap[currentOperator]} ${currentValue} = ${result}`
      );

      display.value = String(result);
      operatorDisplay.value = "=";
      storedValue = null;
      currentOperator = null;
      lastAction = "equals";
    }
    return;
  }
});

/* -------- CLOSE HISTORY -------- */
closeHistoryBtn.addEventListener("click", () => {
  historyPopup.classList.add("hidden");
});
