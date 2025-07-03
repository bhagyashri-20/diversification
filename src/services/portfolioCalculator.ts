
interface Holding {
  symbol: string;
  name: string;
  sector: string;
  region: string;
  assetClass: string;
  value: number;
  percentage: number;
}

interface DiversificationScores {
  overall: number;
  sector: number;
  assetClass: number;
  geographic: number;
  concentration: number;
}

interface AdvancedMetrics {
  herfindahlIndex: number;
  effectiveNumberOfHoldings: number;
  correlationRisk: number;
  concentrationByValue: number;
  diversificationRatio: number;
}

// Advanced Herfindahl-Hirschman Index for concentration measurement
const calculateHerfindahlIndex = (allocations: number[]): number => {
  const totalSquared = allocations.reduce((sum, allocation) => {
    const proportion = allocation / 100;
    return sum + (proportion * proportion);
  }, 0);
  return totalSquared * 10000; // Scale to 0-10000
};

// Calculate effective number of holdings (inverse of HHI)
const calculateEffectiveHoldings = (allocations: number[]): number => {
  const hhi = calculateHerfindahlIndex(allocations);
  return hhi > 0 ? 10000 / hhi : 0;
};

// Shannon Entropy with logarithmic penalty for extreme concentration
const calculateAdvancedEntropy = (allocations: number[]): number => {
  const nonZeroAllocations = allocations.filter(a => a > 0);
  if (nonZeroAllocations.length <= 1) return 0;
  
  const totalAllocation = nonZeroAllocations.reduce((sum, a) => sum + a, 0);
  if (totalAllocation === 0) return 0;
  
  // Calculate Shannon entropy
  const entropy = -nonZeroAllocations.reduce((sum, allocation) => {
    const p = allocation / totalAllocation;
    return sum + (p * Math.log2(p));
  }, 0);
  
  // Apply concentration penalty for extreme allocations
  const maxAllocation = Math.max(...nonZeroAllocations);
  const concentrationPenalty = maxAllocation > 50 ? Math.pow((maxAllocation - 50) / 50, 2) : 0;
  
  // Apply small holdings bonus (reward having many small positions)
  const smallHoldingsCount = nonZeroAllocations.filter(a => a < 10).length;
  const smallHoldingsBonus = Math.min(smallHoldingsCount * 0.1, 1);
  
  // Normalize and apply modifiers
  const maxEntropy = Math.log2(nonZeroAllocations.length);
  const baseScore = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
  
  return Math.max(0, Math.min(100, baseScore - (concentrationPenalty * 20) + (smallHoldingsBonus * 5)));
};

// Calculate concentration risk with multiple factors
const calculateAdvancedConcentrationScore = (holdings: Holding[]): number => {
  if (holdings.length === 0) return 0;
  
  const sortedByPercentage = holdings.sort((a, b) => b.percentage - a.percentage);
  const sortedByValue = holdings.sort((a, b) => b.value - a.value);
  
  let score = 100;
  
  // Factor 1: Top holding concentration (most critical)
  const top1Concentration = sortedByPercentage[0]?.percentage || 0;
  if (top1Concentration > 70) score -= 50;
  else if (top1Concentration > 50) score -= 35;
  else if (top1Concentration > 30) score -= 20;
  else if (top1Concentration > 20) score -= 10;
  else if (top1Concentration > 15) score -= 5;
  
  // Factor 2: Top 3 holdings concentration
  const top3Concentration = sortedByPercentage
    .slice(0, 3)
    .reduce((sum, holding) => sum + holding.percentage, 0);
  if (top3Concentration > 90) score -= 30;
  else if (top3Concentration > 80) score -= 25;
  else if (top3Concentration > 70) score -= 20;
  else if (top3Concentration > 60) score -= 15;
  else if (top3Concentration > 50) score -= 10;
  
  // Factor 3: Top 5 holdings concentration
  const top5Concentration = sortedByPercentage
    .slice(0, 5)
    .reduce((sum, holding) => sum + holding.percentage, 0);
  if (top5Concentration > 95) score -= 20;
  else if (top5Concentration > 85) score -= 15;
  else if (top5Concentration > 75) score -= 10;
  
  // Factor 4: Number of holdings bonus/penalty
  const holdingsCount = holdings.length;
  if (holdingsCount < 5) score -= 25;
  else if (holdingsCount < 10) score -= 15;
  else if (holdingsCount < 15) score -= 5;
  else if (holdingsCount > 50) score += 10;
  else if (holdingsCount > 30) score += 5;
  
  // Factor 5: Value concentration vs percentage concentration alignment
  const topValueHolding = sortedByValue[0];
  const topPercentageHolding = sortedByPercentage[0];
  if (topValueHolding?.symbol !== topPercentageHolding?.symbol) {
    score += 5; // Bonus for having different top holdings by value vs percentage
  }
  
  // Factor 6: Small holdings presence (< 2% each)
  const smallHoldingsCount = holdings.filter(h => h.percentage < 2).length;
  const smallHoldingsRatio = smallHoldingsCount / holdings.length;
  if (smallHoldingsRatio > 0.5) score += 10;
  else if (smallHoldingsRatio > 0.3) score += 5;
  
  return Math.max(0, Math.min(100, score));
};

// Calculate sector diversification with industry correlation factors
const calculateSectorScore = (holdings: Holding[]): number => {
  const sectorAllocations = Object.values(
    holdings.reduce((acc, holding) => {
      acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>)
  );
  
  // Base entropy score
  let baseScore = calculateAdvancedEntropy(sectorAllocations);
  
  // Apply sector-specific penalties and bonuses
  const sectorData = holdings.reduce((acc, holding) => {
    if (!acc[holding.sector]) {
      acc[holding.sector] = { allocation: 0, count: 0 };
    }
    acc[holding.sector].allocation += holding.percentage;
    acc[holding.sector].count += 1;
    return acc;
  }, {} as Record<string, { allocation: number; count: number }>);
  
  // Penalty for over-concentration in cyclical sectors
  const cyclicalSectors = ['Banking', 'Real Estate', 'Automobile', 'Construction', 'Metals'];
  const cyclicalConcentration = cyclicalSectors.reduce((sum, sector) => {
    return sum + (sectorData[sector]?.allocation || 0);
  }, 0);
  
  if (cyclicalConcentration > 60) baseScore -= 15;
  else if (cyclicalConcentration > 40) baseScore -= 10;
  
  // Bonus for defensive sector presence
  const defensiveSectors = ['Healthcare', 'Consumer Staples', 'Utilities', 'Pharmaceuticals'];
  const defensivePresence = defensiveSectors.some(sector => 
    (sectorData[sector]?.allocation || 0) > 5
  );
  if (defensivePresence) baseScore += 5;
  
  // Penalty for missing technology exposure in modern portfolios
  const techAllocation = sectorData['Technology']?.allocation || 0;
  if (techAllocation < 5) baseScore -= 10;
  else if (techAllocation > 30) baseScore -= 5; // Over-concentration penalty
  
  return Math.max(0, Math.min(100, baseScore));
};

// Calculate asset class diversification with correlation considerations
const calculateAssetClassScore = (holdings: Holding[]): number => {
  const assetClassAllocations = Object.values(
    holdings.reduce((acc, holding) => {
      acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>)
  );
  
  let baseScore = calculateAdvancedEntropy(assetClassAllocations);
  
  const assetData = holdings.reduce((acc, holding) => {
    if (!acc[holding.assetClass]) {
      acc[holding.assetClass] = { allocation: 0, count: 0 };
    }
    acc[holding.assetClass].allocation += holding.percentage;
    acc[holding.assetClass].count += 1;
    return acc;
  }, {} as Record<string, { allocation: number; count: number }>);
  
  // Bonus for having bonds in portfolio (risk reduction)
  const bondAllocation = Object.keys(assetData)
    .filter(key => key.toLowerCase().includes('bond'))
    .reduce((sum, key) => sum + assetData[key].allocation, 0);
  
  if (bondAllocation > 10 && bondAllocation < 40) baseScore += 10;
  else if (bondAllocation > 5) baseScore += 5;
  
  // Bonus for international exposure
  const internationalAllocation = Object.keys(assetData)
    .filter(key => key.toLowerCase().includes('international') || key.toLowerCase().includes('global'))
    .reduce((sum, key) => sum + assetData[key].allocation, 0);
  
  if (internationalAllocation > 10) baseScore += 10;
  else if (internationalAllocation > 5) baseScore += 5;
  
  // Penalty for over-concentration in equity
  const equityAllocation = Object.keys(assetData)
    .filter(key => key.toLowerCase().includes('equity') || key.toLowerCase().includes('stock'))
    .reduce((sum, key) => sum + assetData[key].allocation, 0);
  
  if (equityAllocation > 90) baseScore -= 15;
  else if (equityAllocation > 80) baseScore -= 10;
  
  // Bonus for alternative investments (commodities, REITs)
  const alternativeAllocation = Object.keys(assetData)
    .filter(key => 
      key.toLowerCase().includes('commodity') || 
      key.toLowerCase().includes('reit') ||
      key.toLowerCase().includes('gold')
    )
    .reduce((sum, key) => sum + assetData[key].allocation, 0);
  
  if (alternativeAllocation > 5 && alternativeAllocation < 20) baseScore += 5;
  
  return Math.max(0, Math.min(100, baseScore));
};

// Calculate geographic diversification with regional correlation factors
const calculateGeographicScore = (holdings: Holding[]): number => {
  const geographicAllocations = Object.values(
    holdings.reduce((acc, holding) => {
      acc[holding.region] = (acc[holding.region] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>)
  );
  
  let baseScore = calculateAdvancedEntropy(geographicAllocations);
  
  const regionData = holdings.reduce((acc, holding) => {
    if (!acc[holding.region]) {
      acc[holding.region] = { allocation: 0, count: 0 };
    }
    acc[holding.region].allocation += holding.percentage;
    acc[holding.region].count += 1;
    return acc;
  }, {} as Record<string, { allocation: number; count: number }>);
  
  // Penalty for over-concentration in single region
  const maxRegionAllocation = Math.max(...Object.values(regionData).map(r => r.allocation));
  if (maxRegionAllocation > 85) baseScore -= 20;
  else if (maxRegionAllocation > 70) baseScore -= 15;
  else if (maxRegionAllocation > 60) baseScore -= 10;
  
  // Bonus for developed market presence
  const developedMarkets = ['US', 'Europe', 'Japan', 'Australia', 'Canada'];
  const developedAllocation = developedMarkets.reduce((sum, market) => {
    return sum + (regionData[market]?.allocation || 0);
  }, 0);
  
  if (developedAllocation > 20 && developedAllocation < 60) baseScore += 5;
  
  // Bonus for emerging market exposure (but not too much)
  const emergingMarkets = ['India', 'China', 'Brazil', 'Asia Pacific', 'Latin America'];
  const emergingAllocation = emergingMarkets.reduce((sum, market) => {
    return sum + (regionData[market]?.allocation || 0);
  }, 0);
  
  if (emergingAllocation > 10 && emergingAllocation < 40) baseScore += 5;
  else if (emergingAllocation > 50) baseScore -= 10; // Too much emerging market risk
  
  return Math.max(0, Math.min(100, baseScore));
};

// Calculate overall score with weighted factors and interaction effects
const calculateOverallScore = (scores: Omit<DiversificationScores, 'overall'>): number => {
  const { sector, assetClass, geographic, concentration } = scores;
  
  // Base weighted average
  const baseScore = (
    sector * 0.25 + 
    assetClass * 0.30 + 
    geographic * 0.20 + 
    concentration * 0.25
  );
  
  // Interaction bonuses/penalties
  let interactionAdjustment = 0;
  
  // Bonus if all categories are reasonably well diversified
  if (sector > 60 && assetClass > 60 && geographic > 60 && concentration > 60) {
    interactionAdjustment += 5;
  }
  
  // Penalty if any category is critically poor
  if (sector < 30 || assetClass < 30 || geographic < 30 || concentration < 30) {
    interactionAdjustment -= 10;
  }
  
  // Bonus for balanced performance across all metrics
  const maxScore = Math.max(sector, assetClass, geographic, concentration);
  const minScore = Math.min(sector, assetClass, geographic, concentration);
  const scoreRange = maxScore - minScore;
  
  if (scoreRange < 20) interactionAdjustment += 5; // Well-balanced portfolio
  else if (scoreRange > 40) interactionAdjustment -= 5; // Unbalanced portfolio
  
  return Math.round(Math.max(0, Math.min(100, baseScore + interactionAdjustment)));
};

export const portfolioCalculator = {
  calculateDiversificationScores: (holdings: Holding[]): DiversificationScores => {
    if (holdings.length === 0) {
      return { overall: 0, sector: 0, assetClass: 0, geographic: 0, concentration: 0 };
    }

    // Calculate individual scores using advanced algorithms
    const sectorScore = calculateSectorScore(holdings);
    const assetClassScore = calculateAssetClassScore(holdings);
    const geographicScore = calculateGeographicScore(holdings);
    const concentrationScore = calculateAdvancedConcentrationScore(holdings);

    // Calculate overall score with interaction effects
    const overall = calculateOverallScore({
      sector: sectorScore,
      assetClass: assetClassScore,
      geographic: geographicScore,
      concentration: concentrationScore
    });

    return {
      overall,
      sector: Math.round(sectorScore),
      assetClass: Math.round(assetClassScore),
      geographic: Math.round(geographicScore),
      concentration: Math.round(concentrationScore)
    };
  },

  calculateAdvancedMetrics: (holdings: Holding[]): AdvancedMetrics => {
    if (holdings.length === 0) {
      return {
        herfindahlIndex: 0,
        effectiveNumberOfHoldings: 0,
        correlationRisk: 0,
        concentrationByValue: 0,
        diversificationRatio: 0
      };
    }

    const allocations = holdings.map(h => h.percentage);
    const herfindahlIndex = calculateHerfindahlIndex(allocations);
    const effectiveNumberOfHoldings = calculateEffectiveHoldings(allocations);
    
    // Calculate correlation risk based on sector concentration
    const sectorConcentration = Object.values(
      holdings.reduce((acc, holding) => {
        acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
        return acc;
      }, {} as Record<string, number>)
    );
    const correlationRisk = Math.max(...sectorConcentration);
    
    // Concentration by value (largest holding by value)
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    const concentrationByValue = totalValue > 0 ? (Math.max(...holdings.map(h => h.value)) / totalValue) * 100 : 0;
    
    // Diversification ratio (effective holdings / total holdings)
    const diversificationRatio = holdings.length > 0 ? effectiveNumberOfHoldings / holdings.length : 0;

    return {
      herfindahlIndex: Math.round(herfindahlIndex),
      effectiveNumberOfHoldings: Math.round(effectiveNumberOfHoldings * 10) / 10,
      correlationRisk: Math.round(correlationRisk),
      concentrationByValue: Math.round(concentrationByValue),
      diversificationRatio: Math.round(diversificationRatio * 100) / 100
    };
  },

  getPortfolioMetrics: (holdings: Holding[]) => {
    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    
    const sectorBreakdown = holdings.reduce((acc, holding) => {
      acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    const assetClassBreakdown = holdings.reduce((acc, holding) => {
      acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    const geographicBreakdown = holdings.reduce((acc, holding) => {
      acc[holding.region] = (acc[holding.region] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalValue,
      holdingsCount: holdings.length,
      sectorBreakdown,
      assetClassBreakdown,
      geographicBreakdown
    };
  }
};
