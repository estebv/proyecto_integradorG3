import React from 'react'

/**
 * Componente Checkbox reutilizable
 * Facilita la creación de checkboxes con estilos consistentes
 */
export function Checkbox({ 
  id, 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <div className="flex items-center pt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
      {label && (
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  )
}

/**
 * Grupo de checkboxes para selección única (radio buttons simulados)
 */
export function CheckboxGroup({ 
  options, 
  value, 
  onChange, 
  name = 'checkbox-group',
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {options.map((option, index) => (
        <Checkbox
          key={option.value || index}
          id={`${name}-${option.value || index}`}
          checked={value === option.value}
          onChange={(e) => onChange(e.target.checked ? option.value : value)}
          label={option.label}
          description={option.description}
          disabled={option.disabled}
        />
      ))}
    </div>
  )
}
