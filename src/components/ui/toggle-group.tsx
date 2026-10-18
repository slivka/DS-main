"use client";

/** Skupina přepínačů · vlastní volby a stav pole · nesmí přidávat zprávy pod ovládání. */

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

import { FieldFeedbackIndicator, useFieldStatus } from "../ds/form/field-feedback";
import { Field } from "../ds/layout/form-field-layout";

/** Vlastnosti skupiny přepínačů. */
export interface ToggleGroupStatusProps {
  /** Chyba má přednost před varováním. */
  error?: string;
  /** Nezabraňující upozornění. */
  warning?: string;
  /** Popisek s ikonou stavu. */
  label?: string;
}

/** Zachovává rozlišené jednohodnotové a vícehodnotové API Radix. */
export type ToggleGroupProps = React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> &
  ToggleGroupStatusProps;

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupProps
>(({ className, variant, size, children, error, warning, label, ...props }, ref) => {
  const status = useFieldStatus({ error, warning });
  const group = (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn(
        "flex h-[var(--control-h)] items-center justify-center gap-1 rounded-md",
        className,
        status.className,
      )}
      {...props}
      {...status.controlProps}
    >
      <span id={status.describedById} className="sr-only">
        {status.message}
      </span>
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
  return label ? (
    <Field
      label={
        <>
          <span className={error ? "text-destructive" : ""}>{label}</span>
          <FieldFeedbackIndicator error={error} warning={warning} placement="label" />
        </>
      }
    >
      {group}
    </Field>
  ) : (
    group
  );
});

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
