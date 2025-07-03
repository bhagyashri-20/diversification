
// Asset database with comprehensive Indian market data
export interface AssetInfo {
  symbol: string;
  name: string;
  sector: string;
  region: string;
  assetClass: string;
  type: 'income' | 'growth';
  liquidity: 'high' | 'medium' | 'low';
}

const assets: Record<string, AssetInfo> = {
  // Large Cap Stocks
  'RELIANCE': {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Limited',
    sector: 'Energy & Petrochemicals',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'TCS': {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Limited',
    sector: 'Banking & Financial Services',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },
  'INFY': {
    symbol: 'INFY',
    name: 'Infosys Limited',
    sector: 'Information Technology',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Limited',
    sector: 'Banking & Financial Services',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },
  'HINDUNILVR': {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Limited',
    sector: 'Consumer Goods',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'ITC': {
    symbol: 'ITC',
    name: 'ITC Limited',
    sector: 'Consumer Goods',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },
  'KOTAKBANK': {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Limited',
    sector: 'Banking & Financial Services',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'LT': {
    symbol: 'LT',
    name: 'Larsen & Toubro Limited',
    sector: 'Infrastructure & Construction',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'SBIN': {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Financial Services',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },

  // Mid Cap Stocks
  'BAJFINANCE': {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Limited',
    sector: 'Banking & Financial Services',
    region: 'India',
    assetClass: 'Mid Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'MARUTI': {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Limited',
    sector: 'Automotive',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'WIPRO': {
    symbol: 'WIPRO',
    name: 'Wipro Limited',
    sector: 'Information Technology',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'TECHM': {
    symbol: 'TECHM',
    name: 'Tech Mahindra Limited',
    sector: 'Information Technology',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'HCLTECH': {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Limited',
    sector: 'Information Technology',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },

  // Pharma
  'SUNPHARMA': {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    sector: 'Pharmaceuticals',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'DRREDDY': {
    symbol: 'DRREDDY',
    name: 'Dr. Reddys Laboratories',
    sector: 'Pharmaceuticals',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },

  // Metals & Mining
  'TATASTEEL': {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Limited',
    sector: 'Metals & Mining',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },
  'HINDALCO': {
    symbol: 'HINDALCO',
    name: 'Hindalco Industries Limited',
    sector: 'Metals & Mining',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'growth',
    liquidity: 'high'
  },

  // Power & Utilities
  'NTPC': {
    symbol: 'NTPC',
    name: 'NTPC Limited',
    sector: 'Power & Utilities',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },
  'POWERGRID': {
    symbol: 'POWERGRID',
    name: 'Power Grid Corporation',
    sector: 'Power & Utilities',
    region: 'India',
    assetClass: 'Large Cap Equity',
    type: 'income',
    liquidity: 'high'
  },

  // International ETFs
  'NASDAQ100': {
    symbol: 'NASDAQ100',
    name: 'NASDAQ 100 ETF',
    sector: 'Technology',
    region: 'United States',
    assetClass: 'International Equity ETF',
    type: 'growth',
    liquidity: 'high'
  },
  'GOLDETF': {
    symbol: 'GOLDETF',
    name: 'Gold ETF',
    sector: 'Commodities',
    region: 'Global',
    assetClass: 'Commodity ETF',
    type: 'income',
    liquidity: 'high'
  },

  // Bonds
  'GILT10YR': {
    symbol: 'GILT10YR',
    name: '10 Year Government Bond',
    sector: 'Government Securities',
    region: 'India',
    assetClass: 'Government Bonds',
    type: 'income',
    liquidity: 'medium'
  },
  'CORPBOND': {
    symbol: 'CORPBOND',
    name: 'Corporate Bond Fund',
    sector: 'Corporate Debt',
    region: 'India',
    assetClass: 'Corporate Bonds',
    type: 'income',
    liquidity: 'medium'
  },

  // Real Estate
  'REIT': {
    symbol: 'REIT',
    name: 'Real Estate Investment Trust',
    sector: 'Real Estate',
    region: 'India',
    assetClass: 'REIT',
    type: 'income',
    liquidity: 'medium'
  }
};

export const assetDatabase = {
  getAssetInfo: (symbol: string): AssetInfo | null => {
    return assets[symbol.toUpperCase()] || null;
  },

  searchAssets: (query: string): AssetInfo[] => {
    const searchTerm = query.toLowerCase();
    return Object.values(assets).filter(
      asset => 
        asset.symbol.toLowerCase().includes(searchTerm) ||
        asset.name.toLowerCase().includes(searchTerm)
    );
  },

  getAllSectors: (): string[] => {
    return Array.from(new Set(Object.values(assets).map(asset => asset.sector)));
  },

  getAllAssetClasses: (): string[] => {
    return Array.from(new Set(Object.values(assets).map(asset => asset.assetClass)));
  },

  getAllRegions: (): string[] => {
    return Array.from(new Set(Object.values(assets).map(asset => asset.region)));
  }
};
