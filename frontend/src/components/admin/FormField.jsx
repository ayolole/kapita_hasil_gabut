export default function FormField({
  id,
  label,
  required = false,
  hint = null,
  error = null,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-stone-500">{hint}</p>
      ) : null}
    </div>
  )
}
