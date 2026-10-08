import { animate, stagger as animeStagger, random as animeRandom } from 'animejs';

export const spring = {
  snappy: { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
  fluid: { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 },
  cinematic: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  fast: { duration: 0.15, ease: 'easeOutQuad' },
};

export const stagger = animeStagger;
export const random = animeRandom;

export function anime(config) {
  if (!config) return null;
  const { targets, ...params } = config;
  if (!targets) return null;
  try {
    return animate(targets, params);
  } catch (e) {
    console.warn('anime animation caught error:', e);
    return null;
  }
}

anime.stagger = animeStagger;
anime.random = animeRandom;
anime.utils = {
  stagger: animeStagger,
  random: animeRandom,
};

export default anime;