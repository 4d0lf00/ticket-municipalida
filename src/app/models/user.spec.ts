import { User } from './user.model';

describe('User interface', () => {
  it('should match the expected structure', () => {
    const mockUser: User = {
      name: 'Ana Pérez',
      email: 'ana@empresa.cl',
      department: 'Soporte',
      role: 'user',
    };

    expect(mockUser).toBeTruthy();
    expect(mockUser.name).toBe('Ana Pérez');
    expect(mockUser.role).toBe('user');
  });
});
