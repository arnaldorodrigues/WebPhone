interface SkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "text" | "button";
  shimmer?: boolean;
}

const Skeleton = ({
  className = "",
  variant = "default",
  shimmer = true,
}: SkeletonProps) => {
  const baseClasses = shimmer
    ? "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"
    : "animate-pulse bg-gray-200";

  const variantClasses = {
    default: "rounded",
    circle: "rounded-full",
    text: "rounded",
    button: "rounded-lg",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={
        shimmer
          ? {
              animation:
                "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 2s ease-in-out infinite",
            }
          : undefined
      }
    />
  );
};

export default Skeleton;
