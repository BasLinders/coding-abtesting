/**
 * SNIPPET: Luhn check (card number validation)
 *
 * WHEN TO USE
 *   A test adds inline validation to a payment or gift card field, so users see
 *   a typo before they submit.
 *
 * PITFALLS
 *   - Never read, store, log or send card numbers anywhere. Only validate in the
 *     browser and show a message. Most payment fields are iframes from the payment
 *     provider, and you cannot (and must not) access them.
 *   - Passing the Luhn check does not mean the card is valid, only that there is no typo.
 *
 * WORKS WITH: all platforms
 */

function luhnCheck(input) {
  const digits = String(input).replace(/\D/g, '');
  if (digits.length < 12 || digits.length > 19) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

// Usage
console.log(luhnCheck('4111 1111 1111 1111')); // true
