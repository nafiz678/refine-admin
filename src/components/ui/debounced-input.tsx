
import React from "react";

import { Input } from "./input";
import { cn } from "@/lib/utils";

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  placeholder,
  className,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  placeholder?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Input
      {...props}
      className={`${cn(className)} max-w-lg md:w-64`}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      value={value}
    />
  );
}
