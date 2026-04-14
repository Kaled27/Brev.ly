import React from "react";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`mt-6 flex items-center justify-end gap-2 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
