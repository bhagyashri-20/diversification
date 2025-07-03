
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, BarChart3, Edit } from 'lucide-react';
import { assetDatabase } from '@/services/assetDatabase';
import { extendedAssetDatabase } from '@/services/extendedAssetDatabase';
import { useNavigate, useLocation } from 'react-router-dom';
import AssetSearchInput from '@/components/AssetSearchInput';
import { AssetInfo } from '@/services/assetDatabase';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  region: string;
  assetClass: string;
  assetType: string;
  value: number;
  percentage?: number;
}

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get portfolio data from navigation state if coming back from dashboard
  const existingPortfolio = location.state?.portfolioData || [];
  
  const [holdings, setHoldings] = useState<Holding[]>(existingPortfolio);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    value: '',
    selectedAsset: null as AssetInfo | null
  });
  const [editingHolding, setEditingHolding] = useState<{
    id: string;
    symbol: string;
    value: string;
    selectedAsset: AssetInfo | null;
  } | null>(null);

  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);

  // Update holdings with percentages
  const holdingsWithPercentages = holdings.map(holding => ({
    ...holding,
    percentage: totalValue > 0 ? (holding.value / totalValue) * 100 : 0
  }));

  const getAssetType = (assetClass: string, symbol: string): string => {
    if (assetClass.includes('ETF')) return 'ETF';
    if (assetClass.includes('Mutual Fund') || symbol.includes('FUND')) return 'Mutual Fund';
    if (assetClass.includes('Bond')) return 'Bond';
    if (assetClass.includes('Commodity')) return 'Commodity';
    if (assetClass.includes('Equity')) return 'Stock';
    return 'Other';
  };

  const handleAssetSelect = (asset: AssetInfo) => {
    if (editingHolding) {
      setEditingHolding({
        ...editingHolding,
        symbol: asset.symbol,
        selectedAsset: asset
      });
    } else {
      setNewHolding({
        ...newHolding,
        symbol: asset.symbol,
        selectedAsset: asset
      });
    }
  };

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.value) return;
    
    let assetInfo = newHolding.selectedAsset;
    
    if (!assetInfo) {
      // Try extended database first, then fall back to original
      assetInfo = extendedAssetDatabase.getAssetInfo(newHolding.symbol.toUpperCase());
      if (!assetInfo) {
        assetInfo = assetDatabase.getAssetInfo(newHolding.symbol.toUpperCase());
      }
    }
    
    if (!assetInfo) {
      alert('Asset not found in database. Try searching for stocks, ETFs, or mutual funds.');
      return;
    }

    const assetType = getAssetType(assetInfo.assetClass, assetInfo.symbol);

    const holding: Holding = {
      id: Date.now().toString(),
      symbol: newHolding.symbol.toUpperCase(),
      name: assetInfo.name,
      sector: assetInfo.sector,
      region: assetInfo.region,
      assetClass: assetInfo.assetClass,
      assetType: assetType,
      value: parseFloat(newHolding.value)
    };

    setHoldings([...holdings, holding]);
    setNewHolding({ symbol: '', value: '', selectedAsset: null });
  };

  const startEditHolding = (holding: Holding) => {
    setEditingHolding({
      id: holding.id,
      symbol: holding.symbol,
      value: holding.value.toString(),
      selectedAsset: {
        symbol: holding.symbol,
        name: holding.name,
        sector: holding.sector,
        region: holding.region,
        assetClass: holding.assetClass,
        type: 'growth', // Default type
        liquidity: 'high' // Default liquidity
      }
    });
  };

  const saveEditHolding = () => {
    if (!editingHolding || !editingHolding.symbol || !editingHolding.value) return;
    
    let assetInfo = editingHolding.selectedAsset;
    
    if (!assetInfo) {
      // Try extended database first, then fall back to original
      assetInfo = extendedAssetDatabase.getAssetInfo(editingHolding.symbol.toUpperCase());
      if (!assetInfo) {
        assetInfo = assetDatabase.getAssetInfo(editingHolding.symbol.toUpperCase());
      }
    }
    
    if (!assetInfo) {
      alert('Asset not found in database. Try searching for stocks, ETFs, or mutual funds.');
      return;
    }

    const assetType = getAssetType(assetInfo.assetClass, assetInfo.symbol);

    const updatedHoldings = holdings.map(holding => 
      holding.id === editingHolding.id 
        ? {
            ...holding,
            symbol: editingHolding.symbol.toUpperCase(),
            name: assetInfo!.name,
            sector: assetInfo!.sector,
            region: assetInfo!.region,
            assetClass: assetInfo!.assetClass,
            assetType: assetType,
            value: parseFloat(editingHolding.value)
          }
        : holding
    );

    setHoldings(updatedHoldings);
    setEditingHolding(null);
  };

  const cancelEditHolding = () => {
    setEditingHolding(null);
  };

  const analyzePortfolio = () => {
    if (holdings.length === 0) {
      alert('Please add some holdings to your portfolio before analyzing.');
      return;
    }
    
    // Navigate to dashboard with portfolio data
    navigate('/dashboard', {
      state: {
        portfolioData: holdingsWithPercentages
      }
    });
  };

  const removeHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Portfolio Diversification Analyzer
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Professional-grade portfolio analysis with NIFTY 500, S&P 500, ETFs & Mutual Funds
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
            <Badge variant="outline">NIFTY 500 Stocks</Badge>
            <Badge variant="outline">S&P 500 Stocks</Badge>
            <Badge variant="outline">Top 100 Indian ETFs</Badge>
            <Badge variant="outline">Top 100 US ETFs</Badge>
            <Badge variant="outline">Top 300 Mutual Funds</Badge>
          </div>
        </div>

        {/* Holdings Input Section */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Portfolio Holdings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <AssetSearchInput
                value={editingHolding ? editingHolding.symbol : newHolding.symbol}
                onChange={(value) => {
                  if (editingHolding) {
                    setEditingHolding({ ...editingHolding, symbol: value, selectedAsset: null });
                  } else {
                    setNewHolding({ ...newHolding, symbol: value, selectedAsset: null });
                  }
                }}
                onSelect={handleAssetSelect}
                placeholder="Search stocks, ETFs, mutual funds..."
              />
            </div>
            <Input
              type="number"
              placeholder="Value in ₹"
              value={editingHolding ? editingHolding.value : newHolding.value}
              onChange={(e) => {
                if (editingHolding) {
                  setEditingHolding({ ...editingHolding, value: e.target.value });
                } else {
                  setNewHolding({ ...newHolding, value: e.target.value });
                }
              }}
            />
            {editingHolding ? (
              <div className="flex gap-2">
                <Button onClick={saveEditHolding} className="flex-1">
                  Save Changes
                </Button>
                <Button onClick={cancelEditHolding} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={addHolding} className="w-full">
                Add Holding
              </Button>
            )}
            {holdings.length > 0 && !editingHolding && (
              <Button 
                onClick={analyzePortfolio} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyze Portfolio
              </Button>
            )}
          </div>

          {/* Asset Categories Help */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">Supported Assets:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
              <div>
                <strong>Indian Stocks:</strong>
                <p className="text-gray-600">RELIANCE, TCS, HDFC</p>
              </div>
              <div>
                <strong>US Stocks:</strong>
                <p className="text-gray-600">AAPL, MSFT, GOOGL</p>
              </div>
              <div>
                <strong>Indian ETFs:</strong>
                <p className="text-gray-600">NIFTYBEES, GOLDBEES</p>
              </div>
              <div>
                <strong>US ETFs:</strong>
                <p className="text-gray-600">SPY, QQQ, VTI</p>
              </div>
              <div>
                <strong>Mutual Funds:</strong>
                <p className="text-gray-600">HDFCTOP100, SBILARGEMID</p>
              </div>
            </div>
          </div>

          {holdings.length > 0 && (
            <div className="overflow-x-auto">
              <div className="mb-4 text-right">
                <p className="text-lg font-semibold">
                  Total Portfolio Value: ₹{totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Total Holdings: {holdings.length}
                </p>
              </div>
              
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
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithPercentages.map((holding) => (
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
                      <td className="p-2">{holding.percentage?.toFixed(1)}%</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditHolding(holding)}
                            disabled={!!editingHolding}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeHolding(holding.id)}
                            disabled={!!editingHolding}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {holdings.length === 0 && (
          <Card className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Holdings Added</h3>
            <p className="text-gray-600">
              Add your portfolio holdings above to start analyzing diversification
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
