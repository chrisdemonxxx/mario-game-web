/* global module */
/**
 * Physics Engine Module
 * Implements AABB collision detection and gravity simulation
 */

const GRAVITY = 0.8;  // px/frame²
const TERMINAL_VELOCITY = 15;  // px/frame

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 * @param {Object} rect1 - Rectangle with x, y, width, height
 * @param {Object} rect2 - Rectangle with x, y, width, height
 * @returns {boolean} - True if rectangles overlap
 */
function checkAABB(rect1, rect2) {
    return !(
        rect1.x + rect1.width <= rect2.x ||
        rect2.x + rect2.width <= rect1.x ||
        rect1.y + rect1.height <= rect2.y ||
        rect2.y + rect2.height <= rect1.y
    );
}

/**
 * Apply gravity to an object
 * @param {Object} obj - Object with vy property (vertical velocity)
 */
function applyGravity(obj) {
    // Apply gravity acceleration
    obj.vy += GRAVITY;
    
    // Cap at terminal velocity
    if (obj.vy > TERMINAL_VELOCITY) {
        obj.vy = TERMINAL_VELOCITY;
    }
}

// Export for Jest (CommonJS) while staying usable as a plain <script> in the browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAABB,
        applyGravity,
        GRAVITY,
        TERMINAL_VELOCITY
    };
}
