describe('Player', () => {
    let player;
    beforeEach(() => { player = new Player(50, 300, 0.6, 800, 600); });
    test('Player initialized', () => { expect(player.x).toBe(50); expect(player.health).toBe(3); });
    test('Player movement', () => { player.update({ 'd': true }, [[0,0],[0,0],[1,1]], 32); expect(player.velocityX).toBeGreaterThan(0); });
    test('Player damage', () => { const h = player.health; player.takeDamage(); expect(player.health).toBe(h - 1); });
});