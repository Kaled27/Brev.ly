interface LoadingBarProps {
  className?: string;
}

export const LoadingBar: React.FC<LoadingBarProps> = ({ className = "" }) => {
  return (
    <div
      className={`absolute left-0 top-0 h-[2px] w-full overflow-hidden ${className}`}
    >
      <div className="loading-shimmer h-full w-full" />
    </div>
  );
};
