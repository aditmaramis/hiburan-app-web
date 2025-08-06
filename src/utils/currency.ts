export type Currency = 'USD' | 'IDR';

export interface CurrencyConfig {
	symbol: string;
	code: string;
	name: string;
	decimalPlaces: number;
	thousandsSeparator: string;
	decimalSeparator: string;
}

export const CURRENCY_CONFIGS: Record<Currency, CurrencyConfig> = {
	USD: {
		symbol: '$',
		code: 'USD',
		name: 'US Dollar',
		decimalPlaces: 2,
		thousandsSeparator: ',',
		decimalSeparator: '.',
	},
	IDR: {
		symbol: 'Rp',
		code: 'IDR',
		name: 'Indonesian Rupiah',
		decimalPlaces: 0,
		thousandsSeparator: '.',
		decimalSeparator: ',',
	},
};

export const formatCurrency = (
	amount: number | string,
	currency: Currency = 'IDR'
): string => {
	const config = CURRENCY_CONFIGS[currency];
	const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

	if (isNaN(numAmount)) {
		return `${config.symbol}0`;
	}

	// Format number with appropriate decimal places
	const formatter = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: config.decimalPlaces,
		maximumFractionDigits: config.decimalPlaces,
	});

	let formatted = formatter.format(numAmount);

	// Replace separators based on currency
	if (currency === 'IDR') {
		formatted = formatted.replace(/,/g, '.');
	}

	return `${config.symbol}${formatted}`;
};

export const parseCurrencyInput = (
	input: string,
	currency: Currency = 'IDR'
): number => {
	const config = CURRENCY_CONFIGS[currency];

	// Remove currency symbol and spaces
	let cleaned = input.replace(config.symbol, '').trim();

	// Handle different decimal separators
	if (currency === 'IDR') {
		// For IDR: 1.000.000,50 format
		cleaned = cleaned.replace(/\./g, '').replace(',', '.');
	} else {
		// For USD: 1,000,000.50 format
		cleaned = cleaned.replace(/,/g, '');
	}

	const parsed = parseFloat(cleaned);
	return isNaN(parsed) ? 0 : parsed;
};

export const getCurrencySymbol = (currency: Currency): string => {
	return CURRENCY_CONFIGS[currency].symbol;
};

export const getCurrencyName = (currency: Currency): string => {
	return CURRENCY_CONFIGS[currency].name;
};

export const getSupportedCurrencies = (): Currency[] => {
	return Object.keys(CURRENCY_CONFIGS) as Currency[];
};

export const validateCurrency = (currency: string): currency is Currency => {
	return currency === 'USD' || currency === 'IDR';
};
