// utils.js

/**
 * Calculates the Euclidean distance between two positions.
 * @param {Object} pos1 - The first position with x and y coordinates.
 * @param {Object} pos2 - The second position with x and y coordinates.
 * @returns {number} The distance between pos1 and pos2.
 */
function calculateDistance(pos1, pos2) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
}

module.exports = {
  calculateDistance,
};
