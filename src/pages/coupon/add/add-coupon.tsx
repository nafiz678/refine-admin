import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Database } from "@/lib/supabase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { supabaseClient } from "@/lib";

export type CouponProp =
  Database["content"]["Tables"]["coupons"]["Row"];

const baseSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon name must be at least 3 characters"),
  couponType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountPercentage: z
    .number()
    .min(0, "Must be >= 0").max(100, "Percentage cant be greater than 100")
    .optional(),
  discountAmount: z
    .number()
    .min(0, "Must be >= 0")
    .optional(),
  minCartValue: z
    .number()
    .min(0, "Must be >= 0")
    .optional(),
  startDate: z.string(),
  endDate: z.string(),
});

type FormValues = z.infer<typeof baseSchema>;

export default function AddCouponWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      couponType: "PERCENTAGE",
      code: "",
      discountPercentage: 0,
      discountAmount: 0,
      minCartValue: 0,
      startDate: "",
      endDate: "",
    },
    mode: "onTouched",
  });

  const couponType = form.watch("couponType");

  const triggerStepValidation = async (s: number) => {
    if (s === 1)
      return await form.trigger(["code", "couponType"]);
    if (s === 2)
      return await form.trigger([
        "discountPercentage",
        "discountAmount",
        "minCartValue",
      ]);
    if (s === 3)
      return await form.trigger(["startDate", "endDate"]);
    return true;
  };

  const goNext = async () => {
    const valid = await triggerStepValidation(step);
    if (!valid) return;
    setStep((p) => Math.min(3, p + 1));
  };

  const goBack = () => setStep((p) => Math.max(1, p - 1));

  const generateRandomString = (length = 4) => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(
        Math.floor(Math.random() * chars.length)
      );
    }
    return result;
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const coupon: CouponProp = {
        id: Date.now().toString(36),
        code: `${data.code}-${generateRandomString(4)}`,
        couponType: data.couponType,
        discountAmount: data.discountAmount ?? 0,
        discountPercentage: data.discountPercentage ?? 0,
        minCartValue: Number(data.minCartValue),
        startDate: format(
          new Date(data.startDate),
          "yyyy-MM-dd HH:mm:ss"
        ),
        endDate: format(
          new Date(data.endDate),
          "yyyy-MM-dd HH:mm:ss"
        ),

        createdAt: now,
        updatedAt: now,
      };

      const { error } = await supabaseClient
        .schema("content")
        .from("coupons")
        .insert(coupon);

      if (error) {
        toast.error(
          `Failed to create coupon ${error.message}`
        );
        return;
      }

      console.log("Coupon created (client):", coupon);
      toast.success("Coupon created successfully");
      form.reset();
      setStep(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepLabel = (n: number, title: string) => (
    <button
      type="button"
      onClick={async () => {
        if (n <= step) {
          setStep(n);
          return;
        }
        const valid = await triggerStepValidation(step);
        if (valid) setStep(n);
      }}
      aria-current={step === n ? "step" : undefined}
      className={`flex items-start gap-3 p-3 rounded-md transition-colors w-full text-left ${
        step === n
          ? "bg-muted/60 ring-1 ring-primary"
          : "hover:bg-muted/40"
      }`}
    >
      <div className="w-7 h-7 flex items-center justify-center rounded-full border">
        {n}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        {n === 1 && (
          <span className="text-xs text-muted-foreground">
            Name & type
          </span>
        )}
        {n === 2 && (
          <span className="text-xs text-muted-foreground">
            Discount & min value
          </span>
        )}
        {n === 3 && (
          <span className="text-xs text-muted-foreground">
            Dates & review
          </span>
        )}
      </div>
    </button>
  );

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-2xl font-semibold">
          Create Coupon
        </CardTitle>
        <div className="hidden md:block w-1/3">
          <Progress
            value={(step / 3) * 100}
            className="h-2"
          />
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 bg-transparent">
            <div className="space-y-3 sticky top-6">
              <div className="px-1 py-2">
                {stepLabel(1, "Basic")}
                {stepLabel(2, "Discount")}
                {stepLabel(3, "Dates")}
              </div>

              <div className="px-3 py-2 border rounded-md">
                <p className="text-xs text-muted-foreground">
                  Tip
                </p>
                <p className="text-sm mt-1">
                  All fields are required. You can review
                  your coupon before creating.
                </p>
              </div>
            </div>
          </aside>

          {/* Form area */}
          <main className="md:col-span-8 lg:col-span-9">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Coupon Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="SUMMER25"
                                className="text-lg py-3"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="couponType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Coupon Type
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PERCENTAGE">
                                  Percentage
                                </SelectItem>
                                <SelectItem value="FIXED_AMOUNT">
                                  Fixed Amount
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setStep(1);
                        }}
                        disabled={isSubmitting}
                      >
                        Reset
                      </Button>
                      <Button onClick={goNext}>Next</Button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {couponType === "PERCENTAGE" ? (
                        <FormField
                          control={form.control}
                          name="discountPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Discount Percentage (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step={1}
                                  placeholder="10"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number(e.target.value)
                                    )
                                  }
                                  className="text-lg py-3"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="discountAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Discount Amount
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  placeholder="200"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      Number(e.target.value)
                                    )
                                  }
                                  className="text-lg py-3"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="minCartValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Minimum Cart Value
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="500"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    Number(e.target.value)
                                  )
                                }
                                className="text-lg py-3"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={goBack}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <div className="flex-1" />
                      <Button onClick={goNext}>Next</Button>
                    </div>
                  </div>
                )}

                {/* STEP 3 (Dates + Review) */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Start Date
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full text-left"
                                >
                                  {field.value
                                    ? format(
                                        new Date(
                                          field.value
                                        ),
                                        "yyyy-MM-dd HH:mm:ss"
                                      )
                                    : "Select start date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(
                                          field.value
                                        )
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      const formatted =
                                        format(
                                          date,
                                          "yyyy-MM-dd HH:mm:ss"
                                        );
                                      field.onChange(
                                        formatted
                                      );
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              End Date & Time
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full text-left"
                                >
                                  {field.value
                                    ? format(
                                        new Date(
                                          field.value
                                        ),
                                        "yyyy-MM-dd HH:mm:ss"
                                      )
                                    : "Select end date & time"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(
                                          field.value
                                        )
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      const formatted =
                                        format(
                                          date,
                                          "yyyy-MM-dd HH:mm:ss"
                                        );
                                      field.onChange(
                                        formatted
                                      );
                                    }
                                  }}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Review */}
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <h4 className="text-sm font-semibold mb-2">
                        Review
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>Code:</strong>{" "}
                          {form.getValues("code")}
                        </div>
                        <div>
                          <strong>Type:</strong>{" "}
                          {form.getValues("couponType")}
                        </div>
                        <div>
                          <strong>Discount:</strong>{" "}
                          {form.getValues("couponType") ===
                          "PERCENTAGE"
                            ? `${
                                form.getValues(
                                  "discountPercentage"
                                ) ?? "-"
                              }%`
                            : `${
                                form.getValues(
                                  "discountAmount"
                                ) ?? "-"
                              }`}
                        </div>
                        <div>
                          <strong>Min Cart:</strong>{" "}
                          {form.getValues("minCartValue")}
                        </div>
                        <div>
                          <strong>Start:</strong>{" "}
                          {form.getValues("startDate")}
                        </div>
                        <div>
                          <strong>End:</strong>{" "}
                          {form.getValues("endDate")}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={goBack}
                        disabled={isSubmitting}
                      >
                        Back
                      </Button>
                      <div className="flex-1" />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Creating..."
                          : "Create Coupon"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </main>
        </div>
      </CardContent>
    </Card>
  );
}
