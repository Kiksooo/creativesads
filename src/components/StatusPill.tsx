interface StatusPillProps {
  status: string;
  className?: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-800',
};

export default function StatusPill({ status, className = '' }: StatusPillProps) {
  const colorClass = statusColors[status.toLowerCase()] || statusColors.draft;
  
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${colorClass} ${className} shadow-sm`}
    >
      {status}
    </span>
  );
}

