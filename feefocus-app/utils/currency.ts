export const EXCHANGE_RATES: { [key: string]: number } = {
  PLN: 1,
  USD: 3.6,
  GBP: 4.86,
  EUR: 4.22,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;

  const amountInPLN = amount * fromRate;
  const convertedAmount = amountInPLN / toRate;

  return convertedAmount;
};

export const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`;
};
