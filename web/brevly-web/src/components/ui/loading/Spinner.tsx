import { CircleNotch } from "@phosphor-icons/react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 32,
  className = "",
}) => {
  return (
    <CircleNotch
      size={size}
      className={`animate-spin text-blue-base ${className}`}
      weight="bold"
    />
  );
};
