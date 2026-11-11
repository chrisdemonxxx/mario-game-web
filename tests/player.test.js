const Player = require('../src/player');

describe('Player', () => {
    let player;
    beforeEach(() => { 
        player = new Player(50, 300);
    });
    test('Player initialized', () => { 
        expect(player.x).toBe(50); 
        expect(player.health).toBe(3); 
    });
    test('Player movement', () => { 
        player.updateInput({ d: true });
        player.update([], []);
        expect(player.velX).toBeGreaterThan(0); 
    });
    test('Player damage', () => { 
        const h = player.health; 
        player.takeDamage(); 
        expect(player.health).toBe(h - 1); 
    });
    test('Player collision', () => { 
        const obj = { x: 50, y: 300, width: 20, height: 30 }; 
        expect(player.checkCollision(obj)).toBe(true); 
    });
});
