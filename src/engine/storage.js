import { DEFAULT_TEACHER_CONFIG } from '../config/experimentConfig';

const STORAGE_KEYS = {
  TRIALS: 'ohms_law_trials',
  SCORE: 'ohms_law_score',
  CONFIG: 'ohms_law_config',
  COMPLETED_CHALLENGES: 'ohms_law_completed_challenges',
  QUIZ_SCORE: 'ohms_law_quiz_score',
};

export const labStorage = {
  getTrials() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRIALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTrials(trials) {
    try {
      localStorage.setItem(STORAGE_KEYS.TRIALS, JSON.stringify(trials));
    } catch {
      // Storage failure fallback
    }
  },

  clearTrials() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TRIALS);
    } catch {
      // Storage fallback
    }
  },

  getConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return data ? { ...DEFAULT_TEACHER_CONFIG, ...JSON.parse(data) } : DEFAULT_TEACHER_CONFIG;
    } catch {
      return DEFAULT_TEACHER_CONFIG;
    }
  },

  saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch {
      // Storage fallback
    }
  },

  getCompletedChallenges() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_CHALLENGES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  markChallengeCompleted(id) {
    try {
      const current = this.getCompletedChallenges();
      if (!current.includes(id)) {
        current.push(id);
        localStorage.setItem(STORAGE_KEYS.COMPLETED_CHALLENGES, JSON.stringify(current));
      }
    } catch {
      // Storage fallback
    }
  },

  getScore() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCORE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveScore(score) {
    try {
      localStorage.setItem(STORAGE_KEYS.SCORE, JSON.stringify(score));
    } catch {
      // Storage fallback
    }
  }
};
