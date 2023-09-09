export const virtualTagColorMap: { [key: string]: { colors: string; logo?: string; } } = {
  NEW: {
    colors: "bg-[#FCA33A] text-white",
    logo: undefined,
  },
  DISCUSSION: {
    colors: "bg-[#F65874] text-white",
    logo: undefined,
  },
  CONSENSUS: {
    colors: "bg-[#7B61FF] text-white",
    logo: undefined,
  },
  CLOSED: {
    colors: "bg-dark-grey text-white",
    logo: undefined,
  },
  CREATIVE: {
    colors: "text-blue bg-blue/20",
    logo: '/brush.svg',
  },
  COMMUNITY: {
    colors: "text-pink bg-pink/20",
    logo: '/heart.svg',
  },
  GOVERNANCE: {
    colors: "text-yellow bg-yellow/20",
    logo: '/ticket-alt.svg',
  },
  PUBLIC_GOOD: {
    colors: "text-green bg-green/20",
    logo: '/globe.svg',
  },
  SOFTWARE: {
    colors: "text-light-purple bg-light-purple/20",
    logo: '/code.svg',
  },
  HARDWARE: {
    colors: "text-orange bg-orange/20",
    logo: '/gear.svg',
  },
  OTHER: {
    colors: "text-purple bg-purple/20",
    logo: '/question.svg',
  },
};
