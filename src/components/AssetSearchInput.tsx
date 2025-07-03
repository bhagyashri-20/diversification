
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { extendedAssetDatabase } from '@/services/extendedAssetDatabase';
import { AssetInfo } from '@/services/assetDatabase';

interface AssetSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (asset: AssetInfo) => void;
  placeholder?: string;
}

const AssetSearchInput: React.FC<AssetSearchInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = "Search for stocks, ETFs, mutual funds..."
}) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<AssetInfo[]>([]);

  useEffect(() => {
    if (value.length >= 1) {
      const results = extendedAssetDatabase.searchAssets(value).slice(0, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [value]);

  const handleSelect = (asset: AssetInfo) => {
    onSelect(asset);
    setOpen(false);
    onChange(asset.symbol);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-50" align="start">
        <Command>
          <CommandInput 
            placeholder="Search assets..." 
            value={value}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>No assets found.</CommandEmpty>
            <CommandGroup>
              {searchResults.map((asset) => (
                <CommandItem
                  key={asset.symbol}
                  value={asset.symbol}
                  onSelect={() => handleSelect(asset)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === asset.symbol ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{asset.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {asset.assetClass}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600 truncate">{asset.name}</span>
                    <span className="text-xs text-gray-500">{asset.sector} • {asset.region}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AssetSearchInput;
