import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto">
      <Label className="mb-1 sm:mb-0 text-sm font-medium text-muted-foreground">
        Filter by Category
      </Label>

      <Select
        value={selectedCategory ?? "all"}
        onValueChange={(value) =>
          onCategoryChange(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          {/* Use "all" instead of empty string */}
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
