// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to put your own details on the site.
//  Everything shown on the page comes from here.
//  Leave a field as an empty string or empty list to hide it.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Akarsha',
  role: 'Computer Science Graduate Student',
  tagline: 'I build intelligent systems and explore how machines learn, reason and see.',
  location: 'Your City, Country',
  email: 'you@example.com',
  // Put a PDF named resume.pdf in the /public folder, or change this to a full URL.
  resumeUrl: 'resume.pdf',
  // Optional photo: put the image in /public and write its file name here, e.g. 'me.jpg'.
  photo: '',
  links: [
    { label: 'GitHub', url: 'https://github.com/ShaminAkarsha' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/your-profile' },
    { label: 'Google Scholar', url: 'https://scholar.google.com/' },
  ],
};

export const about = {
  paragraphs: [
    'I am a graduate student in Computer Science focused on building reliable, efficient and useful software. My work sits where research meets engineering: turning ideas from papers into systems people can actually use.',
    'Outside of coursework I enjoy contributing to open source, mentoring juniors and writing about what I learn.',
  ],
  interests: [
    'Machine Learning',
    'Computer Vision',
    'Distributed Systems',
    'Natural Language Processing',
    'Human-Computer Interaction',
    'Cloud Computing',
  ],
  education: [
    { degree: 'M.Sc. in Computer Science', school: 'Your University', period: '2025 – Present', note: 'Focus: Machine Learning' },
    { degree: 'B.Sc. in Computer Science', school: 'Your University', period: '2021 – 2025', note: 'First Class Honours' },
  ],
  skills: {
    Languages: ['Python', 'TypeScript', 'Java', 'C++', 'SQL'],
    'ML & Data': ['PyTorch', 'scikit-learn', 'Pandas', 'OpenCV'],
    'Web & Cloud': ['React', 'Node.js', 'Docker', 'Azure', 'Git'],
  },
};

// status: 'Current' marks ongoing work; anything else is shown as-is.
export const projects = [
  {
    title: 'Project One',
    status: 'Current',
    description: 'A short, one or two sentence summary of what this project does and why it matters.',
    tags: ['Python', 'PyTorch', 'FastAPI'],
    links: [
      { label: 'Code', url: 'https://github.com/ShaminAkarsha' },
      { label: 'Demo', url: '#' },
    ],
  },
  {
    title: 'Project Two',
    status: 'Current',
    description: 'Describe the problem, your approach and the result. Numbers help, e.g. “cut latency by 40%”.',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    links: [{ label: 'Code', url: 'https://github.com/ShaminAkarsha' }],
  },
  {
    title: 'Project Three',
    status: '2025',
    description: 'A past project you are proud of. Mention your role if it was a team effort.',
    tags: ['C++', 'OpenGL'],
    links: [{ label: 'Code', url: 'https://github.com/ShaminAkarsha' }],
  },
  {
    title: 'Project Four',
    status: '2024',
    description: 'Another highlight, such as a hackathon build, a course project or an open source contribution.',
    tags: ['Java', 'Android'],
    links: [],
  },
];

export const research = [
  {
    title: 'Title of Your Paper or Research Project',
    venue: 'Conference / Journal / Thesis, 2026',
    authors: 'Akarsha, Co-Author, Supervisor',
    summary: 'Two or three sentences on the research question, the method and the key finding.',
    links: [
      { label: 'Paper', url: '#' },
      { label: 'Code', url: '#' },
    ],
  },
  {
    title: 'Ongoing Research Topic',
    venue: 'In progress, Your Lab',
    authors: 'Supervised by Prof. Name',
    summary: 'What you are currently investigating and what you hope to show.',
    links: [],
  },
];

export const achievements = [
  { year: '2026', title: 'Graduate Research Scholarship', detail: 'Awarded by Your University for research excellence.' },
  { year: '2025', title: "Dean's List", detail: 'Top 5% of the graduating class.' },
  { year: '2025', title: 'Hackathon Winner', detail: 'First place at Example Hackathon among 80 teams.' },
  { year: '2024', title: 'Teaching Assistant', detail: 'Data Structures and Algorithms, 120 students.' },
];
