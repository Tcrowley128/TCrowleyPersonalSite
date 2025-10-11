describe('Example Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should work with strings', () => {
    const greeting = 'Hello World';
    expect(greeting).toContain('World');
  });

  it('should work with arrays', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain('banana');
  });

  it('should work with objects', () => {
    const user = { name: 'Tyler', role: 'admin' };
    expect(user).toHaveProperty('name');
    expect(user.role).toBe('admin');
  });
});
