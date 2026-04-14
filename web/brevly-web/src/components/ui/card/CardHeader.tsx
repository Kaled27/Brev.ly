import React from "react";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`mb-4 flex flex-col gap-2 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
