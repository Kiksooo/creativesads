import CreativeCard, { type Creative } from './CreativeCard';

interface CreativeGridProps {
  creatives: Creative[];
  locale: string;
}

export default function CreativeGrid({ creatives, locale }: CreativeGridProps) {
  if (creatives.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {creatives.map((creative) => (
        <CreativeCard key={creative.id} creative={creative} locale={locale} />
      ))}
    </div>
  );
}


