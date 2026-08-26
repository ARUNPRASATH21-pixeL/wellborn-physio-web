/* =========================================================
   WELLBORN PHYSIO
   COMMON ANIMATIONS
========================================================= */

export const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


export const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -35,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


export const fadeRight = {
  hidden: {
    opacity: 0,
    x: 35,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


export const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    filter: "blur(4px)",
  },

  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",

    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


export const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.97,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};


export const stagger = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};


export const viewportSettings = {
  once: true,
  amount: 0.12,
};