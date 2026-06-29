'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface ComboboxOption {
  value: string;
  label?: string;
}

interface ComboboxProps {
  label: string;
  value?: string;
  options: ComboboxOption[];
  placeholder: string;
  emptyMessage?: string;
  onChange: (value: string | undefined) => void;
}

export function Combobox({
  label,
  value,
  options,
  placeholder,
  emptyMessage = 'Sin resultados',
  onChange,
}: ComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const labelText = option.label ?? option.value;
      return (
        option.value.toLowerCase().includes(normalizedQuery) ||
        labelText.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [options, query]);

  useEffect(() => {
    setQuery(value ?? '');
  }, [value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  function selectOption(option: ComboboxOption) {
    setQuery(option.value);
    onChange(option.value);
    setIsOpen(false);
  }

  function handleQueryChange(nextQuery: string) {
    setQuery(nextQuery);
    setIsOpen(true);

    if (nextQuery.trim() === '') {
      onChange(undefined);
    }
  }

  return (
    <div className="filter-field combobox" ref={containerRef}>
      <label className="filter-label" htmlFor={`${listboxId}-input`}>
        {label}
      </label>
      <div className="combobox-control">
        <input
          id={`${listboxId}-input`}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && filteredOptions[activeIndex]
              ? `${listboxId}-${filteredOptions[activeIndex].value}`
              : undefined
          }
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => handleQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setIsOpen(true);
              setActiveIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActiveIndex((current) => Math.max(current - 1, 0));
            }

            if (event.key === 'Enter' && isOpen && filteredOptions[activeIndex]) {
              event.preventDefault();
              selectOption(filteredOptions[activeIndex]);
            }

            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
        />
        {query ? (
          <button
            type="button"
            className="combobox-clear"
            aria-label={`Limpiar ${label}`}
            onClick={() => {
              setQuery('');
              onChange(undefined);
              setIsOpen(false);
            }}
          >
            x
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="combobox-menu" id={listboxId} role="listbox">
          {filteredOptions.length > 0 ? (
            filteredOptions.slice(0, 12).map((option, index) => (
              <button
                type="button"
                id={`${listboxId}-${option.value}`}
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`combobox-option ${index === activeIndex ? 'active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
              >
                <span>{option.label ?? option.value}</span>
                <strong>{option.value}</strong>
              </button>
            ))
          ) : (
            <p className="combobox-empty">{emptyMessage}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
