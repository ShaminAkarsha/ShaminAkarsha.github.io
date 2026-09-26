import { TextField, TextArea, TagsField, ParagraphsField, ListEditor, LinksEditor } from './fields.jsx';

// One editor per database row. Each receives the section's value and a setter.

export function ProfileEditor({ value: p, onChange }) {
  const set = (k) => (v) => onChange({ ...p, [k]: v });
  return (
    <>
      <div className="adm-row">
        <TextField label="Name" value={p.name} onChange={set('name')} />
        <TextField label="Role" value={p.role} onChange={set('role')} />
      </div>
      <TextArea label="Tagline" value={p.tagline} onChange={set('tagline')} rows={2} />
      <div className="adm-row">
        <TextField label="Email" type="email" value={p.email} onChange={set('email')} />
        <TextField label="Location" value={p.location} onChange={set('location')} />
      </div>
      <div className="adm-row">
        <TextField label="Résumé link" hint="A full URL, or a file name in /public." value={p.resumeUrl} onChange={set('resumeUrl')} />
        <TextField label="Photo" hint="A full image URL, or a file name in /public. Leave empty to hide." value={p.photo} onChange={set('photo')} />
      </div>
      <LinksEditor label="Social and profile links" value={p.links} onChange={set('links')} />
    </>
  );
}

// Skills are stored as { group: [items] } but edited as an ordered list.
const skillsToList = (obj) => Object.entries(obj || {}).map(([group, items]) => ({ group, items }));
const listToSkills = (list) => Object.fromEntries(list.map((s) => [s.group, s.items]));

export function AboutEditor({ value: a, onChange }) {
  const set = (k) => (v) => onChange({ ...a, [k]: v });
  return (
    <>
      <ParagraphsField label="About text" value={a.paragraphs} onChange={set('paragraphs')} />
      <TagsField label="Professional interests" value={a.interests} onChange={set('interests')} />
      <ListEditor
        label="Education"
        items={a.education}
        onChange={set('education')}
        blank={{ degree: '', school: '', period: '', note: '' }}
        addLabel="Add education"
        itemTitle={(e) => e.degree}
        renderItem={(e, s) => (
          <>
            <div className="adm-row">
              <TextField label="Degree" value={e.degree} onChange={(v) => s({ ...e, degree: v })} />
              <TextField label="School" value={e.school} onChange={(v) => s({ ...e, school: v })} />
            </div>
            <div className="adm-row">
              <TextField label="Period" value={e.period} onChange={(v) => s({ ...e, period: v })} placeholder="2025 – Present" />
              <TextField label="Note" value={e.note} onChange={(v) => s({ ...e, note: v })} placeholder="Focus: Machine Learning" />
            </div>
          </>
        )}
      />
      <ListEditor
        label="Skills"
        items={skillsToList(a.skills)}
        onChange={(list) => set('skills')(listToSkills(list))}
        blank={{ group: 'New group', items: [] }}
        addLabel="Add skill group"
        itemTitle={(g) => g.group}
        renderItem={(g, s) => (
          <>
            <TextField label="Group name" value={g.group} onChange={(v) => s({ ...g, group: v })} />
            <TagsField label="Skills" value={g.items} onChange={(v) => s({ ...g, items: v })} />
          </>
        )}
      />
    </>
  );
}

export function ProjectsEditor({ value, onChange }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={{ title: '', status: 'Current', description: '', tags: [], links: [] }}
      addLabel="Add project"
      itemTitle={(p) => p.title}
      renderItem={(p, s) => (
        <>
          <div className="adm-row">
            <TextField label="Title" value={p.title} onChange={(v) => s({ ...p, title: v })} />
            <TextField label="Status" hint="“Current” shows a live badge; anything else, like a year, shows as is." value={p.status} onChange={(v) => s({ ...p, status: v })} />
          </div>
          <TextArea label="Description" value={p.description} onChange={(v) => s({ ...p, description: v })} />
          <TagsField label="Tags" value={p.tags} onChange={(v) => s({ ...p, tags: v })} />
          <LinksEditor value={p.links} onChange={(v) => s({ ...p, links: v })} />
        </>
      )}
    />
  );
}

export function ResearchEditor({ value, onChange }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={{ title: '', venue: '', authors: '', summary: '', links: [] }}
      addLabel="Add research"
      itemTitle={(r) => r.title}
      renderItem={(r, s) => (
        <>
          <TextField label="Title" value={r.title} onChange={(v) => s({ ...r, title: v })} />
          <div className="adm-row">
            <TextField label="Venue" value={r.venue} onChange={(v) => s({ ...r, venue: v })} placeholder="Conference, 2026" />
            <TextField label="Authors" value={r.authors} onChange={(v) => s({ ...r, authors: v })} />
          </div>
          <TextArea label="Summary" value={r.summary} onChange={(v) => s({ ...r, summary: v })} />
          <LinksEditor value={r.links} onChange={(v) => s({ ...r, links: v })} />
        </>
      )}
    />
  );
}

export function AchievementsEditor({ value, onChange }) {
  return (
    <ListEditor
      items={value}
      onChange={onChange}
      blank={{ year: String(new Date().getFullYear()), title: '', detail: '' }}
      addLabel="Add achievement"
      itemTitle={(a) => (a.year ? `${a.year} · ${a.title}` : a.title)}
      renderItem={(a, s) => (
        <>
          <div className="adm-row adm-row--narrow-first">
            <TextField label="Year" value={a.year} onChange={(v) => s({ ...a, year: v })} />
            <TextField label="Title" value={a.title} onChange={(v) => s({ ...a, title: v })} />
          </div>
          <TextArea label="Detail" value={a.detail} onChange={(v) => s({ ...a, detail: v })} rows={2} />
        </>
      )}
    />
  );
}
