/**
 * Site-wide shipping notice, shown as the store banner and in the order
 * confirmation email. Driven by the date (NZ time) so it updates itself while
 * nobody is at the keyboard. Returns null when there is nothing to say.
 *
 * Nov–Dec 2026 plan:
 *  - until Sun 15 Nov 12:00  : order now to ship before the two-week close
 *  - 15 Nov 12:00 – 27 Nov   : closed, orders ship from Sat 28 Nov
 *  - 28 Nov – 18 Dec         : gift-wrapped for Christmas; AU cut-off Fri 11 Dec
 */
export function shippingNotice(now: Date = new Date()): string | null {
  // NZ wall-clock as a comparable number: YYYYMMDDHH
  const nz = new Date(now.toLocaleString("en-US", { timeZone: "Pacific/Auckland" }));
  const key = nz.getFullYear() * 1_000_000 + (nz.getMonth() + 1) * 10_000 + nz.getDate() * 100 + nz.getHours();

  if (key < 2026111512) {
    return "Heads up: we're closed for two weeks from Monday 16 November. Order by midday Sunday 15 November and your socks ship before we close. Anything after that ships from 28 November.";
  }
  if (key < 2026112800) {
    return "We're closed until 28 November. You can still order now, and everything will ship in order from Saturday 28 November. Thank you for your patience.";
  }
  if (key < 2026121200) {
    return "Christmas at Nine2Five: every order is gift-wrapped and ready for under the tree. Aotearoa, order by Friday 18 December. Australia, order by Friday 11 December.";
  }
  if (key < 2026121900) {
    return "Christmas at Nine2Five: every order is gift-wrapped and ready for under the tree. Aotearoa, order by Friday 18 December for delivery before Christmas.";
  }
  return null;
}
