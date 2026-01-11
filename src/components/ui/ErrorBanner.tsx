import { Alert } from './Alert';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export default function ErrorBanner({ message, onDismiss, className = '' }: ErrorBannerProps) {
  return (
    <Alert variant="error" className={className}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium flex-1">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 flex-shrink-0 text-red-600 hover:text-red-800 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </Alert>
  );
}

