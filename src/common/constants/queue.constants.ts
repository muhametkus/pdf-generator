export const QUEUE_NAMES = {
  PDF_GENERATION: 'pdf-generation',
  EXTERNAL_API_UPDATE: 'external-api-update',
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 3000,
  },
  removeOnComplete: 100,
  removeOnFail: 500,
};
