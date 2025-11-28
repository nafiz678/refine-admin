import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, ImageIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

type SizeKey =
  | "XS"
  | "S"
  | "M"
  | "L"
  | "XL"
  | "XXL"
  | "ONE_SIZE";
type StatusKey =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK"
  | "DISCONTINUED"
  | "COMING_SOON";

export type VariantSize = {
  id: string;
  size: SizeKey;
  stockQty: string | number;
  status: StatusKey;
  price: string | number;
  discountPrice: string | number | null;
  expiresAt?: string;
};

export type ColorGroup = {
  id: string;
  colorName: string;
  image?: File | string;
  sizes: VariantSize[];
};

interface VariantsCardProps {
  initialVariants?: ColorGroup[];
  value: ColorGroup[];
  onChange: (next: ColorGroup[]) => void;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

function uid() {
  return crypto.randomUUID();
}

export function VariantsCard({
  initialVariants = [],
  value,
  onChange,
}: VariantsCardProps) {
  // local state mirrors controlled `value` so we can manage previews easily
  const [groups, setGroups] = useState<ColorGroup[]>(() => {
    if (initialVariants && initialVariants.length > 0) {
      // map incoming initialVariants into canonical shape
      return initialVariants.map((g) => ({
        ...g,
        id: g.id ?? uid(),
        sizes: (g.sizes ?? []).map((s) => ({
          ...s,
          id: s.id ?? uid(),
        })),
      }));
    }
    return value ?? [];
  });
  const objectUrls = useRef<Record<string, string>>({});

  // Sync to parent (controlled) whenever groups change
  useEffect(() => {
    onChange?.(groups);
  }, [groups, onChange]);

  // If controlled `value` changes externally (edit-mode reload), sync it
  useEffect(() => {
    if (!value) return;
    // simple shallow compare by length; if different, replace local state
    if (
      JSON.stringify(value.map((v) => v.id)) !==
      JSON.stringify(groups.map((g) => g.id))
    ) {
      setGroups(
        value.map((g) => ({
          ...g,
          id: g.id ?? uid(),
          sizes: (g.sizes ?? []).map((s) => ({
            ...s,
            id: s.id ?? uid(),
          })),
        }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    return () => {
      Object.values(objectUrls.current).forEach((u) =>
        URL.revokeObjectURL(u)
      );
      objectUrls.current = {};
    };
  }, []);

  // Helpers
  const addColor = () => {
    const newColor: ColorGroup = {
      id: uid(),
      colorName: "",
      image: undefined,
      sizes: [
        {
          id: uid(),
          size: "M",
          stockQty: "",
          status: "IN_STOCK",
          price: "",
          discountPrice: "",
          expiresAt: "",
        },
      ],
    };
    setGroups((prev) => [...prev, newColor]);
  };

  const removeColor = (colorId: string) => {
    // revoke object URL if exists
    const g = groups.find((x) => x.id === colorId);
    if (g?.image && typeof g.image !== "string") {
      const key = `${colorId}-image`;
      if (objectUrls.current[key]) {
        URL.revokeObjectURL(objectUrls.current[key]);
        delete objectUrls.current[key];
      }
    }
    setGroups((prev) =>
      prev.filter((p) => p.id !== colorId)
    );
  };

  const updateColor = (
    colorId: string,
    patch: Partial<ColorGroup>
  ) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === colorId ? { ...g, ...patch } : g
      )
    );
  };

  const addSizeToColor = (colorId: string) => {
    const newSize: VariantSize = {
      id: uid(),
      size: "M",
      stockQty: "",
      status: "IN_STOCK",
      price: "",
      discountPrice: "",
      expiresAt: "",
    };
    setGroups((prev) =>
      prev.map((g) =>
        g.id === colorId
          ? { ...g, sizes: [...g.sizes, newSize] }
          : g
      )
    );
  };

  const removeSize = (colorId: string, sizeId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== colorId) return g;
        return {
          ...g,
          sizes: g.sizes.filter((s) => s.id !== sizeId),
        };
      })
    );
  };

  const updateSize = (
    colorId: string,
    sizeId: string,
    patch: Partial<VariantSize>
  ) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== colorId) return g;
        return {
          ...g,
          sizes: g.sizes.map((s) =>
            s.id === sizeId ? { ...s, ...patch } : s
          ),
        };
      })
    );
  };

  const handleImageFile = (
    colorId: string,
    file: File | null
  ) => {
    if (!file) {
      updateColor(colorId, { image: undefined });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image is too large. Max 2MB.");
      return;
    }
    // create preview URL & keep track of it
    const key = `${colorId}-image`;
    if (objectUrls.current[key]) {
      URL.revokeObjectURL(objectUrls.current[key]);
    }
    const url = URL.createObjectURL(file);
    objectUrls.current[key] = url;
    updateColor(colorId, { image: file });
  };

  const imagePreviewSrc = (g: ColorGroup) => {
    const key = `${g.id}-image`;

    if (g.image) {
      if (typeof g.image === "string") {
        // If it's coming from backend
        return `${
          import.meta.env.VITE_SUPABASE_URL
        }/storage/v1/object/public/${g.image}`;
      }

      // If it's a File
      return (
        objectUrls.current[key] ??
        URL.createObjectURL(g.image)
      );
    }

    return undefined;
  };

  // UI
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>
          Product Variants (Colors & Sizes)
        </CardTitle>
        <CardDescription>
          Create color groups — each group can have an image
          and multiple size entries.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {groups.length === 0 && (
          <div className="p-4 rounded border border-dashed text-center">
            <p className="mb-2">
              No variants yet. Click below to add a color
              group.
            </p>
            <Button
              onClick={addColor}
              variant="outline"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Color
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start flex-col lg:flex-row gap-4 w-full">
                  {/* Image + color name */}
                  <div className="flex flex-col items-center gap-2 w-44">
                    <div className="w-28 h-28 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                      {imagePreviewSrc(group) ? (
                        // show preview from string or object URL
                        <img
                          src={imagePreviewSrc(group)}
                          alt={`Preview ${
                            group.colorName || "color"
                          }`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-sm opacity-70 p-2">
                          <ImageIcon className="mb-1" />
                          <div className="text-xs">
                            No image
                          </div>
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageFile(
                            group.id,
                            e.target.files
                              ? e.target.files[0]
                              : null
                          )
                        }
                        className="sr-only"
                        id={`file-${group.id}`}
                      />
                      <Button
                        type="button"
                        onClick={() =>
                          document
                            .getElementById(
                              `file-${group.id}`
                            )
                            ?.click()
                        }
                        size="sm"
                        variant="ghost"
                        className="w-full"
                      >
                        Upload Image
                      </Button>
                    </label>
                  </div>

                  <div className="w-full">
                    <div className="flex gap-4 items-center mb-2 flex-wrap">
                      <FormItem className="flex-1">
                        <FormLabel>Color name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Red, Midnight Blue"
                            value={group.colorName}
                            onChange={(e) =>
                              updateColor(group.id, {
                                colorName: e.target.value,
                              })
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Human readable color label.
                        </FormDescription>
                      </FormItem>

                      <div className="shrink-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            removeColor(group.id)
                          }
                          aria-label={`Remove color ${
                            group.colorName || ""
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />{" "}
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Sizes table */}
                    <div className="space-y-3">
                      {group.sizes.map((s) => (
                        <div
                          key={s.id}
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 items-end border rounded p-3"
                        >
                          <FormItem className="md:col-span-1">
                            <FormLabel>Size</FormLabel>
                            <Select
                              value={s.size}
                              onValueChange={(val) =>
                                updateSize(group.id, s.id, {
                                  size: val as SizeKey,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(
                                  [
                                    "XS",
                                    "S",
                                    "M",
                                    "L",
                                    "XL",
                                    "XXL",
                                    "ONE_SIZE",
                                  ] as SizeKey[]
                                ).map((sz) => (
                                  <SelectItem
                                    key={sz}
                                    value={sz}
                                  >
                                    {sz}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          <FormItem className="md:col-span-1">
                            <FormLabel>Status</FormLabel>
                            <Select
                              value={s.status}
                              onValueChange={(val) =>
                                updateSize(group.id, s.id, {
                                  status: val as StatusKey,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(
                                  [
                                    "IN_STOCK",
                                    "LOW_STOCK",
                                    "OUT_OF_STOCK",
                                    "DISCONTINUED",
                                    "COMING_SOON",
                                  ] as StatusKey[]
                                ).map((st) => (
                                  <SelectItem
                                    key={st}
                                    value={st}
                                  >
                                    {st}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>

                          <FormItem className="md:col-span-1">
                            <FormLabel>Stock Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                // min={0}
                                placeholder="0"
                                value={s.stockQty}
                                onChange={(e) =>
                                  updateSize(
                                    group.id,
                                    s.id,
                                    {
                                      stockQty: Number(
                                        e.target.value
                                      ),
                                    }
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem className="md:col-span-1">
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                // min={0}
                                placeholder="0"
                                value={s.price}
                                onChange={(e) =>
                                  updateSize(
                                    group.id,
                                    s.id,
                                    {
                                      price: Number(
                                        e.target.value
                                      ),
                                    }
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>

                          <FormItem className="md:col-span-1">
                            <FormLabel>Discount</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                // min={0}
                                value={
                                  s.discountPrice ?? ""
                                }
                                onChange={(e) =>
                                  updateSize(
                                    group.id,
                                    s.id,
                                    {
                                      discountPrice: Number(
                                        e.target.value
                                      ),
                                    }
                                  )
                                }
                              />
                            </FormControl>
                          </FormItem>

                          <div className="md:col-span-1 flex items-center gap-2">
                            <FormItem>
                              <FormLabel>Expires</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                  >
                                    {s.expiresAt
                                      ? s.expiresAt
                                      : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={
                                      s.expiresAt
                                        ? new Date(
                                            s.expiresAt
                                          )
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      updateSize(
                                        group.id,
                                        s.id,
                                        {
                                          expiresAt: date
                                            ? formatTimeCalendar(
                                                date
                                              )
                                            : "",
                                        }
                                      )
                                    }
                                  />
                                </PopoverContent>
                              </Popover>
                            </FormItem>

                            <div className="self-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  removeSize(group.id, s.id)
                                }
                                aria-label="Remove size"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() =>
                            addSizeToColor(group.id)
                          }
                          size="sm"
                        >
                          <Plus className="mr-2 w-4 h-4" />
                          Add Size
                        </Button>
                        <FormDescription className="self-center">
                          Add additional sizes for this
                          color.
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Button type="button" onClick={addColor}>
              <Plus className="mr-2 w-4 h-4" /> Add Color
            </Button>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="text-sm">
              Total color groups: {groups.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const formatTimeCalendar = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
