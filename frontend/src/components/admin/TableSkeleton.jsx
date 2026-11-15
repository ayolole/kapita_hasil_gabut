export default function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div className="divide-y divide-stone-100" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className={`skeleton h-4 ${columnIndex === 0 ? 'w-2/5' : 'flex-1'}`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
