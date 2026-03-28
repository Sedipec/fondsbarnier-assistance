export {
  normalizeEmail,
  createDossier,
  getDossierById,
  getDossierByUserId,
  listDossiers,
  updateDossier,
  advanceEtape,
  toggleDocument,
  addNote,
} from './service';

export type { CreateDossierInput, CreateDossierResult } from './service';
