import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Target, ArrowLeft, BarChart3, PieChart as PieChartIcon, Plus, RotateCcw, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { portfolioCalculator } from '@/services/portfolioCalculator';
import { insightEngine } from '@/services/insightEngine';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  region: string;
  assetClass: string;
  assetType: string;
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

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const portfolioData = location.state?.portfolioData;
  
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [scores, setScores] = useState<DiversificationScores>({
    overall: 0,
    sector: 0,
    assetClass: 0,
    geographic: 0,
    concentration: 0
  });
  const [insights, setInsights] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [rebalanceModel, setRebalanceModel] = useState<'balanced' | 'aggressive' | 'conservative'>('balanced');
  const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
  const [showAllocationDetail, setShowAllocationDetail] = useState(false);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);

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

  const allocationReasons = {
    'Large Cap Equity': {
      reason: 'Large cap stocks provide stability and steady growth with lower volatility',
      benefits: ['Lower risk than small caps', 'Steady dividend income', 'Market leadership', 'Economic moats']
    },
    'Mid Cap Equity': {
      reason: 'Mid cap stocks offer balanced growth potential with moderate risk',
      benefits: ['Higher growth potential', 'Less volatile than small caps', 'Good diversification', 'Emerging market leaders']
    },
    'International Equity ETF': {
      reason: 'International exposure reduces geographic concentration risk',
      benefits: ['Geographic diversification', 'Currency hedging', 'Access to global markets', 'Reduced country-specific risk']
    },
    'Government Bonds': {
      reason: 'Government bonds provide capital preservation and steady income',
      benefits: ['Capital preservation', 'Steady income', 'Low credit risk', 'Portfolio stability']
    },
    'Corporate Bonds': {
      reason: 'Corporate bonds offer higher yields than government bonds with acceptable risk',
      benefits: ['Higher yields', 'Credit diversification', 'Fixed income', 'Portfolio balance']
    },
    'Commodity ETF': {
      reason: 'Commodities provide inflation protection and portfolio diversification',
      benefits: ['Inflation hedge', 'Portfolio diversification', 'Tangible assets', 'Economic cycle protection']
    }
  };

  const getAssetType = (assetClass: string, symbol: string): string => {
    if (assetClass.includes('ETF')) return 'ETF';
    if (assetClass.includes('Mutual Fund') || symbol.includes('FUND')) return 'Mutual Fund';
    if (assetClass.includes('Bond')) return 'Bond';
    if (assetClass.includes('Commodity')) return 'Commodity';
    if (assetClass.includes('Equity')) return 'Stock';
    return 'Other';
  };

  const getAssetTypeColor = (assetType: string) => {
    switch (assetType) {
      case 'Stock': return 'bg-blue-100 text-blue-800';
      case 'ETF': return 'bg-green-100 text-green-800';
      case 'Mutual Fund': return 'bg-purple-100 text-purple-800';
      case 'Bond': return 'bg-yellow-100 text-yellow-800';
      case 'Commodity': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    if (portfolioData && portfolioData.length > 0) {
      const holdingsWithTypes = portfolioData.map((holding: any) => ({
        ...holding,
        assetType: getAssetType(holding.assetClass, holding.symbol)
      }));
      setHoldings(holdingsWithTypes);
      
      const newScores = portfolioCalculator.calculateDiversificationScores(holdingsWithTypes);
      setScores(newScores);
      
      const portfolioInsights = insightEngine.generateInsights(holdingsWithTypes, 'balanced');
      setInsights(portfolioInsights);
      
      const recommendations = insightEngine.generateRecommendations(holdingsWithTypes);
      setSuggestions(recommendations);
    } else {
      navigate('/');
    }
  }, [portfolioData, navigate]);

  useEffect(() => {
    if (holdings.length > 0) {
      const portfolioInsights = insightEngine.generateInsights(holdings, rebalanceModel);
      setInsights(portfolioInsights);
      
      const recommendations = insightEngine.generateRecommendations(holdings);
      setSuggestions(recommendations);
    }
  }, [rebalanceModel, holdings]);

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-bold mb-4">No Portfolio Data Found</h2>
          <p className="text-gray-600 mb-6">Please return to the main page to analyze your portfolio.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200' };
    return { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' };
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskBand = (score: number) => {
    if (score >= 70) return { label: 'LOW RISK', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 50) return { label: 'MODERATE RISK', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'HIGH RISK', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const riskBand = getRiskBand(scores.overall);
  const overallScoreColors = getScoreColor(scores.overall);

  const handleBackToPortfolio = () => {
    navigate('/', {
      state: {
        portfolioData: holdings
      }
    });
  };

  const handleNewPortfolio = () => {
    navigate('/');
  };

  // Chart data preparation with proper formatting
  const sectorData = Object.entries(
    holdings.reduce((acc, holding) => {
      acc[holding.sector] = (acc[holding.sector] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>)
  ).map(([sector, percentage]) => ({ 
    name: sector, 
    value: Math.round(percentage),
    fullName: sector
  }));

  const assetClassData = Object.entries(
    holdings.reduce((acc, holding) => {
      acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.percentage;
      return acc;
    }, {} as Record<string, number>)
  ).map(([assetClass, percentage]) => ({ 
    name: assetClass, 
    value: Math.round(percentage),
    fullName: assetClass
  }));

  // Get holdings for hovered sector
  const getSectorHoldings = (sector: string) => {
    return holdings.filter(holding => holding.sector === sector);
  };

  // Get holdings for asset class
  const getAssetClassHoldings = (assetClass: string) => {
    return holdings.filter(holding => holding.assetClass === assetClass);
  };

  // Rebalancing data for doughnut charts
  const currentAllocation = holdings.reduce((acc, holding) => {
    acc[holding.assetClass] = (acc[holding.assetClass] || 0) + holding.percentage;
    return acc;
  }, {} as Record<string, number>);

  const currentPieData = Object.entries(currentAllocation).map(([assetClass, percentage]) => ({
    name: assetClass,
    value: Math.round(percentage),
    fullName: assetClass
  }));

  const idealPieData = Object.entries(targetModels[rebalanceModel]).map(([assetClass, target]) => ({
    name: assetClass,
    value: target,
    fullName: assetClass
  }));

  const handlePieClick = (data: any, type: 'current' | 'ideal') => {
    if (type === 'current') {
      // Show current holdings for this asset class
      const currentHoldings = holdings.filter(holding => holding.assetClass === data.name);
      setSelectedAllocation({ 
        ...data, 
        type, 
        model: rebalanceModel,
        currentHoldings 
      });
    } else {
      setSelectedAllocation({ ...data, type, model: rebalanceModel });
    }
    setShowAllocationDetail(true);
  };

  const handleSectorClick = (data: any) => {
    const sectorHoldings = getSectorHoldings(data.name);
    setSelectedAllocation({
      name: data.name,
      value: data.value,
      type: 'sector',
      currentHoldings: sectorHoldings
    });
    setShowAllocationDetail(true);
  };

  const handleAssetClassClick = (data: any) => {
    const assetClassHoldings = getAssetClassHoldings(data.name);
    setSelectedAllocation({
      name: data.name,
      value: data.value,
      type: 'assetClass',
      currentHoldings: assetClassHoldings
    });
    setShowAllocationDetail(true);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#FFD700'];

  // Custom tooltips with proper formatting
  const SectorTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sectorHoldings = getSectorHoldings(data.fullName);
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`${data.fullName}: ${data.value}%`}</p>
          <div className="mt-2 space-y-1">
            {sectorHoldings.map((holding, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{holding.symbol}</span>: ₹{holding.value.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const AssetClassTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const assetHoldings = getAssetClassHoldings(data.fullName);
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{`${data.fullName}: ${data.value}%`}</p>
          <div className="mt-2 space-y-1">
            {assetHoldings.map((holding, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">{holding.symbol}</span>: ₹{holding.value.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const DoughnutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="font-semibold">{`${data.fullName}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Filter insights based on portfolio to show only relevant ones
  const getRelevantInsights = () => {
    if (!insights) return null;

    // Show top 3 most critical risk contributors
    const topRisks = insights.topRiskContributors?.slice(0, 3) || [];
    
    // Show only gaps that are actually relevant to current portfolio
    const relevantGaps = insights.diversificationGaps?.filter((gap: string) => {
      // Only show if gap is relevant to current holdings
      const sectors = holdings.map(h => h.sector.toLowerCase());
      const regions = holdings.map(h => h.region.toLowerCase());
      return gap.toLowerCase().includes('sector') || 
             gap.toLowerCase().includes('geographic') ||
             sectors.some(s => gap.toLowerCase().includes(s)) ||
             regions.some(r => gap.toLowerCase().includes(r));
    }).slice(0, 3) || [];

    return {
      topRiskContributors: topRisks,
      diversificationGaps: relevantGaps
    };
  };

  const getRelevantSuggestions = () => {
    // Filter suggestions to show only the most actionable ones
    return suggestions.filter(suggestion => {
      const lowerSuggestion = suggestion.toLowerCase();
      // Show suggestions about diversification, concentration, or specific improvements
      return lowerSuggestion.includes('diversify') || 
             lowerSuggestion.includes('reduce concentration') ||
             lowerSuggestion.includes('consider adding') ||
             lowerSuggestion.includes('allocation');
    }).slice(0, 4); // Show top 4 most relevant suggestions
  };

  const relevantInsights = getRelevantInsights();
  const relevantSuggestions = getRelevantSuggestions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handleBackToPortfolio}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Portfolio Analysis Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Comprehensive analysis of your investment portfolio
            </p>
          </div>
          
          <Button onClick={handleNewPortfolio}>
            <Plus className="mr-2 h-4 w-4" />
            New Portfolio
          </Button>
        </div>

        {/* Diversification Score Only */}
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Overall Diversification Score</h3>
            <div className={`text-6xl font-bold mb-4 ${overallScoreColors.text}`}>
              {scores.overall}/100
            </div>
            <Badge className={`${riskBand.color} text-white text-lg px-4 py-2`}>
              {riskBand.label}
            </Badge>
          </div>
        </Card>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Sector Diversity', score: scores.sector, icon: PieChartIcon },
            { label: 'Asset Class Mix', score: scores.assetClass, icon: BarChart3 },
            { label: 'Geographic Spread', score: scores.geographic, icon: Target },
            { label: 'Concentration Risk', score: scores.concentration, icon: AlertTriangle }
          ].map((item, index) => {
            const scoreColors = getScoreColor(item.score);
            return (
              <Card key={index} className={`p-4 ${scoreColors.border} border-2`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                  <item.icon className="h-5 w-5 text-gray-500" />
                </div>
                <div className={`text-2xl font-bold mb-2 ${scoreColors.text}`}>
                  {item.score}/100
                </div>
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={`h-full transition-all ${getProgressColor(item.score)}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${scoreColors.text} font-medium`}>
                  {item.score >= 70 ? 'Excellent' : item.score >= 50 ? 'Good' : 'Needs Improvement'}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Allocation Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Sector Allocation</h3>
            <p className="text-sm text-gray-600 mb-4">Click on sectors to see detailed holdings</p>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ fullName, value }) => `${fullName}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => handleSectorClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<SectorTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Asset Class Mix</h3>
            <p className="text-sm text-gray-600 mb-4">Click on bars to see detailed holdings</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assetClassData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip content={<AssetClassTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#8884d8"
                  onClick={(data) => handleAssetClassClick(data)}
                  style={{ cursor: 'pointer' }}
                >
                  {assetClassData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Risk Analysis - Only show if there are relevant risks */}
        {relevantInsights && relevantInsights.topRiskContributors.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Key Risk Contributors</h3>
            <div className="space-y-3">
              {relevantInsights.topRiskContributors.map((risk: any, index: number) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{risk.holding}:</strong> {risk.reason}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </Card>
        )}

        {/* Diversification Gaps - Only show relevant gaps */}
        {relevantInsights && relevantInsights.diversificationGaps.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Priority Diversification Areas</h3>
            <div className="space-y-2">
              {relevantInsights.diversificationGaps.map((gap: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{gap}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommendations - Only show most relevant ones */}
        {relevantSuggestions.length > 0 && (
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Priority Recommendations</h3>
            <div className="space-y-3">
              {relevantSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Rebalance Feature - Updated with Doughnut Charts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Portfolio Rebalancing</h3>
            <Select value={rebalanceModel} onValueChange={(value: 'balanced' | 'aggressive' | 'conservative') => setRebalanceModel(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balanced">Balanced Growth</SelectItem>
                <SelectItem value="aggressive">Aggressive Growth</SelectItem>
                <SelectItem value="conservative">Conservative Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Current Allocation</h4>
              <p className="text-sm text-gray-600 mb-4">Click on segments to see your holdings</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={currentPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ fullName, value }) => `${fullName}: ${value}%`}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => handlePieClick(data, 'current')}
                    style={{ cursor: 'pointer' }}
                  >
                    {currentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DoughnutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Ideal Allocation ({rebalanceModel})</h4>
              <p className="text-sm text-gray-600 mb-4">Click on segments to understand the rationale</p>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={idealPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ fullName, value }) => `${fullName}: ${value}%`}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    onClick={(data) => handlePieClick(data, 'ideal')}
                    style={{ cursor: 'pointer' }}
                  >
                    {idealPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<DoughnutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Detail Modal */}
          {showAllocationDetail && selectedAllocation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedAllocation.name}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowAllocationDetail(false)}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedAllocation.type === 'current' ? 'Current' : 
                       selectedAllocation.type === 'ideal' ? 'Recommended' : 'Current'} Allocation: 
                      <span className="font-semibold ml-1">{selectedAllocation.value}%</span>
                    </p>
                  </div>

                  {/* Show current holdings for any allocation type that has holdings */}
                  {selectedAllocation.currentHoldings && selectedAllocation.currentHoldings.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Your Current Holdings:</h4>
                      <div className="space-y-2">
                        {selectedAllocation.currentHoldings.map((holding: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{holding.symbol}</span>
                              <span className="text-sm text-gray-600 ml-2">{holding.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{holding.value.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">{holding.percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show reasoning for ideal allocation */}
                  {selectedAllocation.type === 'ideal' && allocationReasons[selectedAllocation.name] && (
                    <div>
                      <h4 className="font-semibold mb-2">Why this allocation?</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        {allocationReasons[selectedAllocation.name].reason}
                      </p>
                      
                      <h4 className="font-semibold mb-2">Key Benefits:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {allocationReasons[selectedAllocation.name].benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-700">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Holdings Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Portfolio Holdings</h3>
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total Portfolio Value: ₹{totalValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Total Holdings: {holdings.length}
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Sector</th>
                  <th className="text-left p-2">Asset Class</th>
                  <th className="text-left p-2">Value (₹)</th>
                  <th className="text-left p-2">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{holding.symbol}</td>
                    <td className="p-2">{holding.name}</td>
                    <td className="p-2">
                      <Badge className={getAssetTypeColor(holding.assetType)}>
                        {holding.assetType}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">{holding.sector}</Badge>
                    </td>
                    <td className="p-2">
                      <Badge>{holding.assetClass}</Badge>
                    </td>
                    <td className="p-2">₹{holding.value.toLocaleString()}</td>
                    <td className="p-2">{Math.round(holding.percentage)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
