import Link from 'next/link';
import Button from './ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onClick?: () => void;
}

// Note: EmptyState is used with explicit title/description props from parent components
// Default values are only fallback, parents should provide translated strings via t()
export default function EmptyState({
  title = 'No items found',
  description = 'Get started by creating your first item.',
  actionLabel,
  actionHref,
  onClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 relative z-10">
      <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      {actionLabel && (actionHref || onClick) && (
        actionHref ? (
          <Link href={actionHref} className="relative z-10">
            <Button variant="primary" size="lg">
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button variant="primary" size="lg" onClick={onClick} className="relative z-10">
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}

