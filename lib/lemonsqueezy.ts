const STORE_ID = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
const MONTHLY_VARIANT = process.env.NEXT_PUBLIC_LS_PRO_MONTHLY_VARIANT_ID;
const YEARLY_VARIANT = process.env.NEXT_PUBLIC_LS_PRO_YEARLY_VARIANT_ID;

function validateEnv() {
  if (typeof window !== 'undefined') return; // skip validation on client (env vars are inlined)
  if (!STORE_ID) throw new Error('NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID 未设置');
  if (!MONTHLY_VARIANT) throw new Error('NEXT_PUBLIC_LS_PRO_MONTHLY_VARIANT_ID 未设置');
  if (!YEARLY_VARIANT) throw new Error('NEXT_PUBLIC_LS_PRO_YEARLY_VARIANT_ID 未设置');
}

export function getProCheckoutUrl(email?: string): string {
  validateEnv();
  const base = `https://${STORE_ID}.lemonsqueezy.com/checkout/buy/${MONTHLY_VARIANT}`;
  if (email) {
    return `${base}?checkout[email]=${encodeURIComponent(email)}`;
  }
  return base;
}

export function getProYearlyCheckoutUrl(email?: string): string {
  validateEnv();
  const base = `https://${STORE_ID}.lemonsqueezy.com/checkout/buy/${YEARLY_VARIANT}`;
  if (email) {
    return `${base}?checkout[email]=${encodeURIComponent(email)}`;
  }
  return base;
}
