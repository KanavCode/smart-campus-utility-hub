/**
 * Reusable component for displaying loading, empty, and error states
 * Used consistently across admin CRUD pages
 */

import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataStateProps {
  /** Current state of the data */
  state: 'loading' | 'empty' | 'error';
  /** Entity name for messages (e.g., "users", "rooms") */
  entityName: string;
  /** Error message to display (required when state is 'error') */
  errorMessage?: string;
  /** Callback to retry loading */
  onRetry?: () => void;
  /** Loading component to display (default is skeleton rows) */
  loadingComponent?: React.ReactNode;
  /** Callback when user clicks "Create" in empty state */
  onCreate?: () => void;
}

/**
 * Displays loading spinner, empty state, or error message
 * Integrated into table or list components
 */
export const DataStateDisplay = ({
  state,
  entityName,
  errorMessage,
  onRetry,
  loadingComponent,
  onCreate,
}: DataStateProps) => {
  if (state === 'loading') {
    return (
      <>
        {loadingComponent || (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}
      </>
    );
  }

  if (state === 'empty') {
    return (
      <div className="py-12 px-6 text-center">
        <Inbox className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-1">No {entityName} found</h3>
        <p className="text-sm text-muted-foreground/70 mb-6">
          Get started by creating your first {entityName.slice(0, -1)}
        </p>
        {onCreate && (
          <Button onClick={onCreate} className="bg-primary text-primary-foreground font-semibold">
            Create your first {entityName.slice(0, -1)}
          </Button>
        )}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="py-12 px-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-lg font-semibold text-destructive mb-2">Failed to load {entityName}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {errorMessage || `An error occurred while loading ${entityName}`}
        </p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            className="border-destructive/50 hover:bg-destructive/5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return null;
};

/**
 * Skeleton row component for loading state in tables
 * Use inside table tbody
 */
export const SkeletonTableRow = ({ columns = 4 }: { columns?: number }) => (
  <tr className="border-b border-border/50 hover:bg-accent/5">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-4 bg-gradient-to-r from-accent/20 via-accent/30 to-accent/20 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

/**
 * Empty state card component for minimal content
 */
export const EmptyStateCard = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border border-dashed border-border/50 bg-accent/2">
    <Icon className="w-12 h-12 text-muted-foreground/40 mb-3" />
    <h3 className="text-lg font-semibold text-muted-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground/70 mb-6 text-center max-w-sm">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction} className="bg-primary text-primary-foreground font-semibold">
        {actionLabel}
      </Button>
    )}
  </div>
);

/**
 * Error state card component
 */
export const ErrorStateCard = ({
  title = 'Something went wrong',
  description,
  retryLabel = 'Try Again',
  onRetry,
}: {
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 rounded-lg border border-dashed border-destructive/30 bg-destructive/5">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mb-3">
      <AlertCircle className="w-6 h-6 text-destructive" />
    </div>
    <h3 className="text-lg font-semibold text-destructive mb-1">{title}</h3>
    <p className="text-sm text-destructive/70 mb-6 text-center max-w-sm">{description}</p>
    {onRetry && (
      <Button
        onClick={onRetry}
        variant="outline"
        className="border-destructive/50 hover:bg-destructive/5"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        {retryLabel}
      </Button>
    )}
  </div>
);

/**
 * Combined state renderer for tables
 * Shows loading rows, empty state, or error state
 */
export const TableDataStateRenderer = ({
  state,
  itemCount = 0,
  isFiltered = false,
  columns = 4,
  entityName = 'items',
  errorMessage,
  onRetry,
  onCreate,
}: {
  state: 'idle' | 'loading' | 'error';
  itemCount: number;
  isFiltered?: boolean;
  columns?: number;
  entityName?: string;
  errorMessage?: string;
  onRetry?: () => void;
  onCreate?: () => void;
}) => {
  // Loading state
  if (state === 'loading') {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <tr>
        <td colSpan={columns} className="px-6 py-12">
          <ErrorStateCard
            description={errorMessage || `Failed to load ${entityName}`}
            onRetry={onRetry}
          />
        </td>
      </tr>
    );
  }

  // Empty state
  if (itemCount === 0) {
    if (isFiltered) {
      return (
        <tr>
          <td colSpan={columns} className="px-6 py-12 text-center text-muted-foreground">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm">No matching results found</p>
          </td>
        </tr>
      );
    }

    return (
      <tr>
        <td colSpan={columns} className="px-6 py-12">
          <EmptyStateCard
            title={`No ${entityName} yet`}
            description={`Get started by creating your first ${entityName.slice(0, -1)}.`}
            actionLabel={`Create ${entityName.slice(0, -1)}`}
            onAction={onCreate}
          />
        </td>
      </tr>
    );
  }

  // No rows to render (idle state with no items)
  return null;
};
