// Geometry for the intensity slider. The looked-up word always sits at 50%;
// weaker words share the left half and stronger words the right half.

const EDGE = 7; // % of padding kept at each end of the track

export function stopPercents(count, origin) {
  const weaker = origin;
  const stronger = count - origin - 1;
  return Array.from({ length: count }, (_, i) => {
    if (i === origin) return 50;
    if (i < origin) return 50 - ((50 - EDGE) * (origin - i)) / weaker;
    return 50 + ((50 - EDGE) * (i - origin)) / stronger;
  });
}

export function nearestStop(percents, percent) {
  let best = 0;
  for (let i = 1; i < percents.length; i++) {
    if (Math.abs(percents[i] - percent) < Math.abs(percents[best] - percent)) best = i;
  }
  return best;
}
