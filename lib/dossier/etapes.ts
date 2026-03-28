export const ETAPES = [
  { num: 1, label: 'Formulaire recu', phase: 'qualification' },
  { num: 2, label: 'Demande infos cadastrales', phase: 'qualification' },
  { num: 3, label: 'Infos recues du client', phase: 'qualification' },
  { num: 4, label: 'Verification eligibilite DDTM', phase: 'qualification' },
  {
    num: 5,
    label: 'Email eligibilite + presentation devis',
    phase: 'engagement',
  },
  { num: 6, label: 'Signature devis (250 EUR TTC)', phase: 'engagement' },
  {
    num: 7,
    label: 'Collecte des pieces justificatives',
    phase: 'engagement',
  },
  { num: 8, label: 'Depot dossier DDTM', phase: 'instruction' },
  { num: 9, label: 'Instruction (8 mois max)', phase: 'instruction' },
  { num: 10, label: 'Subvention accordee', phase: 'instruction' },
] as const;

export type Phase = (typeof ETAPES)[number]['phase'];

export const PHASE_COLORS = {
  qualification: 'info',
  engagement: 'success',
  instruction: 'warning',
} as const;
