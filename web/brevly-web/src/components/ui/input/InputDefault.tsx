import React from "react";
import { Warning } from "@phosphor-icons/react";

type InputVariant = "primary-default" | "secondary-default";

interface InputDefaultProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  label?: string;
  errorMessage?: string;
  className?: string;
}

const variantClasses: Record<InputVariant, string> = {
  "primary-default":
    "min-w-[250px] max-h-[48px] px-4 py-3 text-gray-600 text-md rounded-lg border border-gray-200 ",
  "secondary-default":
    "max-w-[180px] max-h-[32px] px-3 py-2 bg-gray-200 text-gray-500 text-sm font-semibold rounded-sm border border-gray-300",
};

export const InputDefault: React.FC<InputDefaultProps> = ({
  variant = "primary-default",
  label,
  errorMessage,
  className = "",
  type = "text",
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const baseClasses =
    "outline-none focus:border-blue-base focus:ring-1 focus:ring-blue-base placeholder:text-gray-400";
  const hasError = Boolean(errorMessage);

  return (
    <div className="group flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
            hasError
              ? "text-danger"
              : "text-gray-500 group-focus-within:text-blue-base"
          }`}
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        type={type}
        className={`${baseClasses} ${variantClasses[variant]} ${
          hasError ? "border-danger focus:border-danger focus:ring-danger" : ""
        } ${className}`.trim()}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${inputId}-error` : undefined}
        {...props}
      />

      {hasError ? (
        <div
          id={`${inputId}-error`}
          className="flex items-center gap-1 text-danger text-xs"
        >
          <Warning size={14} weight="fill" />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
};
