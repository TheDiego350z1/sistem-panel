import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ConexionApi } from "~/services/conexionApi";

import type { Provider } from "~/interfaces/provider";

interface ProviderSearchProps {
  value?: number | null;
  onValueChange: (providerId: number | null) => void;
  placeholder?: string;
  token?: string;
  className?: string;
  disabled?: boolean;
}

export function ProviderSearch({
  value,
  onValueChange,
  placeholder = "Search provider...",
  token,
  className,
  disabled = false,
}: ProviderSearchProps) {
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );

  // Función para buscar proveedores
  const searchProviders = async (query: string = "") => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await ConexionApi.get(`/providers/search`, {
        params: {
          q: query,
          limit: 20, // Limitar resultados
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setProviders(response.data.data || response.data);
      }
    } catch (error) {
      console.error("Error searching providers:", error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores iniciales
  useEffect(() => {
    if (token) {
      searchProviders();
    }
  }, [token]);

  // Buscar cuando cambie el query
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (token) {
        searchProviders(searchQuery);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, token]);

  // Encontrar el proveedor seleccionado cuando cambie el value
  useEffect(() => {
    if (value && providers.length > 0) {
      const provider = providers.find((p) => p.id === value);
      setSelectedProvider(provider || null);
    } else {
      setSelectedProvider(null);
    }
  }, [value, providers]);

  const handleSelect = (providerId: string) => {
    const id = parseInt(providerId);
    const provider = providers.find((p) => p.id === id);

    if (provider) {
      setSelectedProvider(provider);
      onValueChange(id);
    } else {
      setSelectedProvider(null);
      onValueChange(null);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedProvider(null);
    onValueChange(null);
    setSearchQuery("");
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedProvider && "text-muted-foreground",
            className
          )}
          disabled={disabled}>
          <div className="flex items-center gap-2 flex-1 text-left">
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {selectedProvider ? selectedProvider.name : placeholder}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {selectedProvider && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="h-4 w-4 rounded-full hover:bg-gray-200 flex items-center justify-center">
                ×
              </button>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0"
        align="start">
        <Command>
          <CommandInput
            placeholder="Search providers..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : "No providers found."}
            </CommandEmpty>
            <CommandGroup>
              {providers.map((provider) => (
                <CommandItem
                  key={provider.id}
                  value={provider.id.toString()}
                  onSelect={handleSelect}
                  className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-medium">{provider.name}</span>
                    {provider.email && (
                      <span className="text-sm text-muted-foreground">
                        {provider.email}
                      </span>
                    )}
                    {provider.phone && (
                      <span className="text-xs text-muted-foreground">
                        📞 {provider.phone}
                      </span>
                    )}
                    {provider.address && (
                      <span className="text-xs text-muted-foreground truncate">
                        📍 {provider.address}
                      </span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      value === provider.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
