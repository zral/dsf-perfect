"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { AdCondition } from "@/types/ad";
import SortSelect from "./SortSelect";

export interface FilterValues {
  price_min?: number;
  price_max?: number;
  conditions: AdCondition[];
  sort: "newest" | "price_asc" | "price_desc";
  location?: string;
}

interface FilterPanelProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

const conditionLabels: Record<AdCondition, string> = {
  [AdCondition.NEW]: "Ny",
  [AdCondition.LIKE_NEW]: "Som ny",
  [AdCondition.GOOD]: "God",
  [AdCondition.FAIR]: "Brukbar",
};

function FilterContent({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Sort */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sortering
        </label>
        <SortSelect
          value={filters.sort}
          onChange={(sort) => onChange({ ...filters, sort })}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sted
        </label>
        <Input
          type="text"
          placeholder="F.eks. Oslo, Bergen..."
          value={filters.location ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              location: e.target.value || undefined,
            })
          }
        />
      </div>

      {/* Price range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prisintervall (kr)
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.price_min ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                price_min: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
          <span className="text-gray-400">—</span>
          <Input
            type="number"
            placeholder="Maks"
            value={filters.price_max ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                price_max: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>
      </div>

      {/* Condition checkboxes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tilstand
        </label>
        <div className="space-y-2">
          {Object.values(AdCondition).map((condition) => (
            <label
              key={condition}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...filters.conditions, condition]
                    : filters.conditions.filter((c) => c !== condition);
                  onChange({ ...filters, conditions: updated });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-700">
                {conditionLabels[condition]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        type="button"
        onClick={() =>
          onChange({
            price_min: undefined,
            price_max: undefined,
            conditions: [],
            sort: "newest",
            location: undefined,
          })
        }
        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
      >
        Nullstill filtre
      </button>
    </div>
  );
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Filtre</h3>
          <FilterContent filters={filters} onChange={onChange} />
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button
          variant="secondary"
          size="sm"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          onClick={() => setMobileOpen(true)}
        >
          Filtre
        </Button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-80 max-w-full bg-white z-50 lg:hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  Filtre
                </h3>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-full pb-24">
                <FilterContent filters={filters} onChange={onChange} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
