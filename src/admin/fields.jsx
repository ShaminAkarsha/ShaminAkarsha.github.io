import { useEffect, useId, useRef, useState } from 'react';

export function Field({ label, hint, children }) {
  const id = useId();
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      {typeof children === 'function' ? children(id) : children}
      {hint && <small className="adm-hint">{hint}</small>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, type = 'text', placeholder }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <input id={id} type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, rows = 3 }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <textarea id={id} rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  );
}

// A text box whose contents are turned into structured data (e.g. a comma list into an array).
// It keeps the raw text while typing, so spaces and separators aren't swallowed mid-word.
function ParsedField({ label, hint, value, onChange, parse, format, multiline, rows }) {
  const [text, setText] = useState(() => format(value));
  useEffect(() => {
    if (JSON.stringify(parse(text)) !== JSON.stringify(value)) setText(format(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const change = (v) => {
    setText(v);
    onChange(parse(v));
  };
  return (
    <Field label={label} hint={hint}>
      {(id) =>
        multiline ? (
          <textarea id={id} rows={rows} value={text} onChange={(e) => change(e.target.value)} />
        ) : (
          <input id={id} value={text} onChange={(e) => change(e.target.value)} />
        )
      }
    </Field>
  );
}

const splitComma = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

export function TagsField({ label, hint = 'Separate with commas.', value, onChange }) {
  return <ParsedField label={label} hint={hint} value={value || []} onChange={onChange} parse={splitComma} format={(a) => a.join(', ')} />;
}

export function ParagraphsField({ label, hint = 'Leave a blank line between paragraphs.', value, onChange }) {
  return (
    <ParsedField
      label={label}
      hint={hint}
      value={value || []}
      onChange={onChange}
      multiline
      rows={8}
      parse={(s) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)}
      format={(a) => a.join('\n\n')}
    />
  );
}

// Editable list of items with add, remove and reorder controls.
export function ListEditor({ label, items, onChange, blank, itemTitle, renderItem, addLabel = 'Add item' }) {
  const list = items || [];
  const [added, setAdded] = useState(-1);
  const addedRef = useRef(null);
  useEffect(() => {
    addedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    addedRef.current?.querySelector('input, textarea')?.focus({ preventScroll: true });
  }, [added]);
  const update = (i, next) => onChange(list.map((it, j) => (j === i ? next : it)));
  const remove = (i) => {
    if (window.confirm(`Remove “${itemTitle(list[i], i)}”?`)) onChange(list.filter((_, j) => j !== i));
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="adm-list">
      {label && <h3 className="adm-list-title">{label}</h3>}
      {list.map((item, i) => (
        <details key={i} ref={i === added ? addedRef : null} className="adm-item" open={list.length <= 2 || i === added}>
          <summary>
            <span className="adm-item-name">{itemTitle(item, i) || 'Untitled'}</span>
            <span className="adm-item-actions">
              <button type="button" onClick={(e) => (e.preventDefault(), move(i, -1))} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" onClick={(e) => (e.preventDefault(), move(i, 1))} disabled={i === list.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="adm-danger" onClick={(e) => (e.preventDefault(), remove(i))} aria-label="Remove">✕</button>
            </span>
          </summary>
          <div className="adm-item-body">{renderItem(item, (next) => update(i, next))}</div>
        </details>
      ))}
      <button type="button" className="adm-add" onClick={() => {
          onChange([...list, structuredClone(blank)]);
          setAdded(list.length);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function LinksEditor({ label = 'Links', value, onChange }) {
  return (
    <ListEditor
      label={label}
      items={value}
      onChange={onChange}
      blank={{ label: '', url: '' }}
      addLabel="Add link"
      itemTitle={(l) => l.label}
      renderItem={(l, set) => (
        <div className="adm-row">
          <TextField label="Label" value={l.label} onChange={(v) => set({ ...l, label: v })} placeholder="GitHub" />
          <TextField label="URL" type="url" value={l.url} onChange={(v) => set({ ...l, url: v })} placeholder="https://" />
        </div>
      )}
    />
  );
}
