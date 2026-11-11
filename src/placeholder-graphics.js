/* eslint-disable no-undef */
// Placeholder Graphics renderer for development
class PlaceholderGraphics {
    constructor() {
        this.width = 32;
        this.height = 32;
        this.defaultColor = '#FF0000';
    }

    drawRectangle(canvas, x, y, width, height, color) {
        if (!canvas) return false;
        if (typeof canvas.getContext !== 'function') return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        ctx.fillStyle = color || this.defaultColor;
        ctx.fillRect(x, y, width, height);
        return true;
    }

    drawCircle(canvas, x, y, radius, color) {
        if (!canvas) return false;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;
        ctx.fillStyle = color || this.defaultColor;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        return true;
    }

    drawPlayer(canvas, x, y, color) {
        return this.drawRectangle(canvas, x, y, 32, 32, color || '#00FF00');
    }

    drawEnemiy(canvas, x, y, color) {
        return this.drawCircle(canvas, x, y, 8, color || '#FFFF00');
    }

    drawGoal(canvas, x, y, color) {
        return this.drawRectangle(canvas, x, y, 40, 40, color || '#FF8800');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlaceholderGraphics;
}
