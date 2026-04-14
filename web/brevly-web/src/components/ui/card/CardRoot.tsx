import React from "react";

interface CardBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardRoot: React.FC<CardBaseProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`w-full max-w-[380px] rounded-lg bg-gray-100 p-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
