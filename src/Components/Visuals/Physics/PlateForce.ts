/**
 * Which way the electric force pushes a charge between two parallel plates, on screen: the field runs from the
 * positive plate to the negative one; a positive charge is pushed along it, a negative one against it. With the
 * plates one above the other, +1 is down and −1 is up.
 */
export const forceDirection = (top: '+' | '-', charge: '+' | '-') => (top === '+' ? 1 : -1) * (charge === '+' ? 1 : -1);
