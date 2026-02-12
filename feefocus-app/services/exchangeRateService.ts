interface ExchangeRate {
  currency: string;
  code: string;
  mid: number;
}

interface NBPTableResponse {
  table: string;
  no: string;
  effectiveDate: string;
  rates: ExchangeRate[];
}

const NBP_API_BASE = 'https://api.nbp.pl/api';
const CURRENCIES = ['USD', 'GBP', 'EUR'];

export interface ExchangeRates {
  PLN: number;
  USD: number;
  GBP: number;
  EUR: number;
  lastUpdated: string;
}

export const fetchExchangeRates = async (): Promise<ExchangeRates> => {
  try {
    const response = await fetch(
      `${NBP_API_BASE}/exchangerates/tables/a/?format=json`
    );

    if (!response.ok) {
      throw new Error(`NBP API error: ${response.status}`);
    }

    const data: NBPTableResponse[] = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No data from NBP API');
    }

    const table = data[0];
    const rates: ExchangeRates = {
      PLN: 1,
      USD: 0,
      GBP: 0,
      EUR: 0,
      lastUpdated: table.effectiveDate,
    };

    table.rates.forEach((rate) => {
      if (CURRENCIES.includes(rate.code)) {
        rates[rate.code as keyof Omit<ExchangeRates, 'lastUpdated'>] = rate.mid;
      }
    });

    const missingCurrencies = CURRENCIES.filter(
      (currency) => rates[currency as keyof Omit<ExchangeRates, 'lastUpdated'>] === 0
    );

    if (missingCurrencies.length > 0) {
      console.warn(`Missing rates for: ${missingCurrencies.join(', ')}`);
    }

    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
};

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  PLN: 1,
  USD: 3.6,
  GBP: 4.86,
  EUR: 4.22,
  lastUpdated: new Date().toISOString().split('T')[0],
};
