import React from "react";

type ButtonVariant =
  | "primary-default"
  | "primary-hover"
  | "primary-disabled"
  | "secondary-default"
  | "secondary-hover"
  | "secondary-disabled";

interface ButtonDefaultProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  "primary-default": "min-w-[250px] max-h-[48px] bg-blue-base text-white text-md",
  "primary-hover": "min-w-[250px] max-h-[48px] bg-blue-dark text-white text-md",
  "primary-disabled": "min-w-[250px] max-h-[48px] bg-blue-base/50 text-white text-md",
  "secondary-default": "max-w-[70px] max-h-[32px] bg-gray-200 text-gray-500 text-sm font-semibold",
  "secondary-hover": "max-w-[70px] max-h-[32px] bg-gray-200 text-gray-500 border border-blue-base text-sm font-semibold",
  "secondary-disabled": "max-w-[70px] max-h-[32px] bg-gray-200/50 text-gray-500/50 text-sm font-semibold",
};

export const ButtonDefault: React.FC<ButtonDefaultProps> = ({
  children,
  variant = "primary-default",
  className = "",
  ...props
}) => {
  const baseClasses =
    " p-4 rounded-lg flex items-center justify-center cursor-pointer";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
