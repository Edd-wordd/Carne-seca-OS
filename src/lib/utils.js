// Shared formatter: uses the browser/Node locale "en-US" to display numbers as money.
// - style: "currency" → adds the $ and commas (e.g. 1,234.56)
// - currency: "USD" → US dollars
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Takes a price in cents (e.g. 1999) and returns a formatted string (e.g. "$19.99").
// We store prices in cents to avoid floating-point rounding errors.
export function formatPrice(price) {
  return currencyFormatter.format(price / 100);
}
