/**
 * SkeletonLoader Component
 * Loading placeholder that mimics content structure
 *
 * @param {Object} props
 * @param {string} props.variant - 'text' | 'rectangular' | 'circular' | 'card'
 * @param {string} props.width - Custom width
 * @param {string} props.height - Custom height
 * @param {number} props.count - Number of skeleton items to render
 */
export default function SkeletonLoader({
  variant = "rectangular",
  width,
  height,
  count = 1,
  className = "",
}) {
  const variantStyles = {
    text: "h-4 rounded",
    rectangular: "h-32 rounded-lg",
    circular: "rounded-full aspect-square",
    card: "h-64 rounded-2xl",
  };

  const skeletonClass = `skeleton ${variantStyles[variant]} ${className}`;

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClass} style={style} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={style} />;
}

/**
 * Skeleton variants for specific use cases
 */

export function SkeletonCard() {
  return (
    <div className="premium-card p-6 space-y-4">
      <div className="skeleton h-6 w-2/3 rounded" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-4/6 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-10 w-24 rounded-lg" />
        <div className="skeleton h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="skeleton h-48 w-full rounded-lg" />
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="flex items-center gap-4">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="skeleton rounded-full w-24 h-24" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-8 w-48 rounded" />
          <div className="skeleton h-4 w-64 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-10 flex-1 rounded" />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton h-12 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
