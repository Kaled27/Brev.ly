import React from "react";

type ButtonVariant =
  | "primary-default"
  | "secondary-default"
  | "icon-default";

interface ButtonDefaultProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  disabled?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  "primary-default":
    "w-full p-4 bg-blue-base text-white text-md rounded-lg hover:bg-blue-dark",
  "secondary-default":
    "max-w-[70px] max-h-[32px] px-3 py-2 bg-gray-200 text-gray-500 text-sm font-semibold rounded-sm hover:border hover:border-blue-base",
  "icon-default":
    "p-2 rounded-sm bg-gray-200 text-gray-600 [&>svg]:w-4 [&>svg]:h-4 hover:border hover:border-blue-base",
};

export const ButtonDefault: React.FC<ButtonDefaultProps> = ({
  children,
  variant = "primary-default",
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none";

  return (
    <button
      type="button"
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
