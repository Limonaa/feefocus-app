import { useSettingsStore } from "@/stores/useSettingsStore";

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

  const exchangeRates = useSettingsStore.getState().exchangeRates;

  const fromRate = (exchangeRates[fromCurrency as keyof typeof exchangeRates] ?? 1) as number;
  const toRate = (exchangeRates[toCurrency as keyof typeof exchangeRates] ?? 1) as number;

  const amountInPLN = amount * fromRate;
  const convertedAmount = amountInPLN / toRate;

  return convertedAmount;
};

export const formatCurrency = (amount: number, currency: string): string => {
  return `${amount.toFixed(2)} ${currency}`;
};
