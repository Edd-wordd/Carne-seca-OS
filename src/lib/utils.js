// Formats prices in cents to dollars for display. Accepts cents as input.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Converts cents to dollars for pricing display.
export function formatPrice(price) {
  return currencyFormatter.format(price / 100);
}
