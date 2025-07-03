import { assetDatabase } from './assetDatabase';

interface Holding {
  symbol: string;
  name: string;
  sector: string;
  region: string;
  assetClass: string;
  value: number;
  percentage: number;
  type?: 'income' | 'growth';
}

interface PortfolioInsights {
  topRiskContributors: Array<{
    holding: string;
    reason: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  diversificationGaps: string[];
  incomeVsGrowth: {
    income: number;
    growth: number;
  };
  liquidityRisk: {
    score: number;
    warning: string;
  };
  rebalancingAlerts: Array<{
    category: string;
    current: number;
    target: number;
    deviation: number;
  }>;
}

const targetModels = {
  aggressive: {
    'Large Cap Equity': 40,
    'Mid Cap Equity': 30,
    'International Equity ETF': 20,
    'Government Bonds': 5,
    'Corporate Bonds': 5
  },
  balanced: {
    'Large Cap Equity': 50,
    'Mid Cap Equity': 20,
    'International Equity ETF': 15,
    'Government Bonds': 10,
    'Corporate Bonds': 5
  },
  conservative: {
    'Large Cap Equity': 40,
    'Mid Cap Equity': 10,
    'International Equity ETF': 10,
    'Government Bonds': 25,
    'Corporate Bonds': 15
  }
};

export const insightEngine = {
  generateInsights: (holdings: Holding[], targetModel: keyof typeof targetModels): PortfolioInsights => {
    // Identify top risk contributors
    const topRiskContributors = holdings
      .filter(h => h.percentage > 25)
      .map(h => ({
        holding: `${h.symbol} (${h.name})`,
        reason: `High concentration at ${h.percentage.toFixed(1)}% of portfolio`,
        impact: h.percentage > 40 ? 'high' : h.percentage > 30 ? 'medium' : 'low'
      }) as const)
      .slice(0, 3);

    // Check for single-sector concentration
    const sectorConcentration = holdings.reduce((acc, holding) => {
      acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(sectorConcentration).forEach(([sector, percentage]) => {
      if (percentage > 40) {
        topRiskContributors.push({
          holding: `${sector} (Sector)`,
          reason: `High concentration at ${percentage.toFixed(1)}% of portfolio`,
          impact: percentage > 60 ? 'high' : 'medium'
        });
      }
    });

    // Identify diversification gaps
    const diversificationGaps: string[] = [];
    const presentSectors = new Set(holdings.map(h => h.sector));
    const presentAssetClasses = new Set(holdings.map(h => h.assetClass));
    const presentRegions = new Set(holdings.map(h => h.region));

    // Check for missing major sectors
    const majorSectors = ['Banking & Financial Services', 'Information Technology', 'Pharmaceuticals', 'Consumer Goods'];
    majorSectors.forEach(sector => {
      if (!presentSectors.has(sector)) {
        diversificationGaps.push(`No exposure to ${sector} sector`);
      }
    });

    // Check for missing asset classes
    if (!presentAssetClasses.has('Government Bonds') && !presentAssetClasses.has('Corporate Bonds')) {
      diversificationGaps.push('No fixed income securities for stability');
    }

    if (!presentAssetClasses.has('International Equity ETF')) {
      diversificationGaps.push('No international exposure for global diversification');
    }

    // Check geographic concentration
    if (presentRegions.size === 1 && presentRegions.has('India')) {
      diversificationGaps.push('Fully concentrated in Indian markets');
    }

    // Calculate income vs growth split
    let incomePercentage = 0;
    let growthPercentage = 0;

    holdings.forEach(holding => {
      const assetInfo = assetDatabase.getAssetInfo(holding.symbol);
      if (assetInfo) {
        if (assetInfo.type === 'income') {
          incomePercentage += holding.percentage;
        } else {
          growthPercentage += holding.percentage;
        }
      }
    });

    // Calculate liquidity risk
    let liquidityScore = 100;
    let liquidityWarning = '';
    
    holdings.forEach(holding => {
      const assetInfo = assetDatabase.getAssetInfo(holding.symbol);
      if (assetInfo?.liquidity === 'low') {
        liquidityScore -= holding.percentage * 0.5;
      } else if (assetInfo?.liquidity === 'medium') {
        liquidityScore -= holding.percentage * 0.2;
      }
    });

    if (liquidityScore < 80) {
      liquidityWarning = 'Portfolio contains significant illiquid holdings';
    }

    // Generate rebalancing alerts
    const currentAssetClassAllocation = holdings.reduce((acc, holding) => {
      acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    const targetAllocation = targetModels[targetModel];
    const rebalancingAlerts = Object.entries(targetAllocation)
      .map(([assetClass, target]) => {
        const current = currentAssetClassAllocation[assetClass] || 0;
        const deviation = current - target;
        
        if (Math.abs(deviation) > 5) {
          return {
            category: assetClass,
            current,
            target,
            deviation
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{
        category: string;
        current: number;
        target: number;
        deviation: number;
      }>;

    return {
      topRiskContributors,
      diversificationGaps,
      incomeVsGrowth: {
        income: incomePercentage,
        growth: growthPercentage
      },
      liquidityRisk: {
        score: Math.max(liquidityScore, 0),
        warning: liquidityWarning
      },
      rebalancingAlerts
    };
  },

  generateRecommendations: (holdings: Holding[]): string[] => {
    const recommendations: string[] = [];
    
    // Check portfolio size
    if (holdings.length < 8) {
      recommendations.push('Consider adding more holdings to achieve better diversification (aim for 8-15 holdings)');
    }

    // Check sector concentration
    const sectorConcentration = holdings.reduce((acc, holding) => {
      acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    const maxSectorConcentration = Math.max(...Object.values(sectorConcentration));
    if (maxSectorConcentration > 40) {
      recommendations.push(`Reduce concentration in your largest sector (${maxSectorConcentration.toFixed(1)}%) to below 30%`);
    }

    // Check individual holding concentration
    const maxHoldingPercentage = Math.max(...holdings.map(h => h.percentage));
    if (maxHoldingPercentage > 20) {
      recommendations.push(`Consider reducing your largest holding to below 20% of total portfolio`);
    }

    // Check for missing asset classes
    const presentAssetClasses = new Set(holdings.map(h => h.assetClass));
    
    if (!presentAssetClasses.has('Government Bonds') && !presentAssetClasses.has('Corporate Bonds')) {
      recommendations.push('Add fixed income securities (bonds) for portfolio stability and regular income');
    }

    if (!presentAssetClasses.has('International Equity ETF')) {
      recommendations.push('Consider adding international exposure through global ETFs for better diversification');
    }

    // Check for commodity exposure
    if (!holdings.some(h => h.sector === 'Commodities')) {
      recommendations.push('Consider adding commodity exposure (Gold ETF) as an inflation hedge');
    }

    // Income vs Growth balance
    const incomeHoldings = holdings.filter(h => {
      const assetInfo = assetDatabase.getAssetInfo(h.symbol);
      return assetInfo?.type === 'income';
    });
    
    const incomePercentage = incomeHoldings.reduce((sum, h) => sum + h.percentage, 0);
    
    if (incomePercentage < 20) {
      recommendations.push('Consider adding more dividend-paying stocks or bonds for regular income generation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your portfolio shows good diversification! Consider periodic rebalancing to maintain target allocations.');
    }

    return recommendations;
  }
};
