export const ROLES = [
  { val: 'frontend',   label: 'Frontend' },
  { val: 'backend',    label: 'Backend' },
  { val: 'fullstack',  label: 'Full-stack' },
  { val: 'devops',     label: 'DevOps' },
  { val: 'data',       label: 'Data / ML' },
  { val: 'other',      label: 'Other' },
]

export const EXPERIENCE_OPTIONS = [
  { val: '1-2',  label: '1–2 yrs' },
  { val: '3-5',  label: '3–5 yrs' },
  { val: '5-10', label: '5–10 yrs' },
  { val: '10+',  label: '10+ yrs' },
]

export const AREAS = [
  { val: 'agent',    label: 'Agent brain' },
  { val: 'solana',   label: 'Solana / Drift' },
  { val: 'frontend', label: 'Frontend' },
  { val: 'api',      label: 'Backend API' },
  { val: 'zones',    label: 'Zone analysis' },
  { val: 'testing',  label: 'Testing' },
  { val: 'docs',     label: 'Documentation' },
]

export interface ContributorFields {
  name: string
  email: string
  github: string
  role: string
  customRole: string
  experience: string
  areas: string[]
  anythingElse: string
  openSource: string   // 'yes' | 'no'
  whatsapp: string
  telegram: string
  heardFrom: string
}

export const defaultContributorFields: ContributorFields = {
  name: '',
  email: '',
  github: '',
  role: '',
  customRole: '',
  experience: '',
  areas: [],
  anythingElse: '',
  openSource: '',
  whatsapp: '',
  telegram: '',
  heardFrom: '',
}
