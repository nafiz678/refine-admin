"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type BaseKey,
  useDeleteButton,
} from "@refinedev/core";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";

type DeleteButtonProps = {
  resource?: string;
  recordItemId?: BaseKey;
  accessControl?: {
    enabled?: boolean;
    hideIfUnauthorized?: boolean;
  };
  meta?: Record<string, unknown>;
} & React.ComponentProps<typeof Button>;

export const DeleteButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  DeleteButtonProps
>(
  (
    {
      resource,
      recordItemId,
      accessControl,
      meta,
      children,
      ...rest
    },
    ref
  ) => {
    const {
      hidden,
      disabled,
      loading,
      onConfirm,
      label,
      confirmTitle: defaultConfirmTitle,
      confirmOkLabel: defaultConfirmOkLabel,
      cancelLabel: defaultCancelLabel,
    } = useDeleteButton({
      resource,
      id: recordItemId,
      accessControl,
      meta,
    });

    const [open, setOpen] = React.useState(false);

    const isDisabled = disabled || rest.disabled || loading;
    const isHidden = hidden || rest.hidden;

    if (isHidden) return null;

    const confirmCancelText = defaultCancelLabel;
    const confirmOkText = defaultConfirmOkLabel;
    const confirmTitle = defaultConfirmTitle;

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span>
            <Button
              {...rest}
              ref={ref}
              disabled={isDisabled}
              className="cursor-pointer px-2 py-0 w-full bg-inherit hover:bg-inherit hover:text-inherit"
              variant={"ghost"}
            >
              {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {children ?? (
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              )}
            </Button>
          </span>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{confirmTitle}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {confirmCancelText}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={() => {
                if (typeof onConfirm === "function") {
                  onConfirm();
                }
                setOpen(false);
              }}
            >
              {confirmOkText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

DeleteButton.displayName = "DeleteButton";
