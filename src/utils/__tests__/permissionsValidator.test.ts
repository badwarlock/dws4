import {
  validatePermissions,
  getMissingDependencies,
  getPermissionsWithMissingDeps,
  hasAllDependencies,
} from '../permissionsValidator';
import { PlatformPermissionInstance } from '../../types/permissions';

describe('permissionsValidator', () => {
  const mockPermissions: Array<PlatformPermissionInstance> = [
    {
      id: '1',
      code: 'READ_USERS',
      name: 'Чтение пользователей',
      description: 'Позволяет просматривать список пользователей',
      is_active: true,
      dependencies: [],
      created: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: 'WRITE_USERS',
      name: 'Запись пользователей',
      description: 'Позволяет создавать и редактировать пользователей',
      is_active: true,
      dependencies: [
        {
          id: '1',
          code: 'READ_USERS',
          name: 'Чтение пользователей',
        },
      ],
      created: '2025-01-01T00:00:00Z',
    },
    {
      id: '3',
      code: 'DELETE_USERS',
      name: 'Удаление пользователей',
      description: 'Позволяет удалять пользователей',
      is_active: true,
      dependencies: [
        {
          id: '1',
          code: 'READ_USERS',
          name: 'Чтение пользователей',
        },
        {
          id: '2',
          code: 'WRITE_USERS',
          name: 'Запись пользователей',
        },
      ],
      created: '2025-01-01T00:00:00Z',
    },
  ];

  describe('validatePermissions', () => {
    it('должен вернуть isValid: true для разрешения без зависимостей', () => {
      const result = validatePermissions([mockPermissions[0]]);

      expect(result.isValid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });

    it('должен вернуть isValid: true когда все зависимости присутствуют', () => {
      const selected = [mockPermissions[0], mockPermissions[1]];
      const result = validatePermissions(selected);

      expect(result.isValid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
    });

    it('должен вернуть isValid: false когда отсутствует одна зависимость', () => {
      // WRITE_USERS зависит от READ_USERS, но READ_USERS не выбран
      const selected = [mockPermissions[1]];
      const result = validatePermissions(selected);

      expect(result.isValid).toBe(false);
      expect(result.missingDependencies).toHaveLength(1);
      expect(result.missingDependencies[0]).toEqual({
        permissionId: '2',
        permissionCode: 'WRITE_USERS',
        permissionName: 'Запись пользователей',
        missingDependencyId: '1',
        missingDependencyCode: 'READ_USERS',
        missingDependencyName: 'Чтение пользователей',
      });
    });

    it('должен вернуть isValid: false когда отсутствуют множественные зависимости', () => {
      // DELETE_USERS зависит от READ_USERS и WRITE_USERS, но они не выбраны
      const selected = [mockPermissions[2]];
      const result = validatePermissions(selected);

      expect(result.isValid).toBe(false);
      expect(result.missingDependencies).toHaveLength(2);
      expect(result.missingDependencies[0].missingDependencyCode).toBe('READ_USERS');
      expect(result.missingDependencies[1].missingDependencyCode).toBe('WRITE_USERS');
    });

    it('должен вернуть isValid: false когда одна из зависимостей отсутствует', () => {
      // DELETE_USERS зависит от READ_USERS и WRITE_USERS
      // READ_USERS присутствует, но WRITE_USERS отсутствует
      const selected = [mockPermissions[0], mockPermissions[2]];
      const result = validatePermissions(selected);

      expect(result.isValid).toBe(false);
      expect(result.missingDependencies).toHaveLength(1);
      expect(result.missingDependencies[0].missingDependencyCode).toBe('WRITE_USERS');
    });

    it('должен вернуть isValid: true для пустого массива', () => {
      const result = validatePermissions([]);

      expect(result.isValid).toBe(true);
      expect(result.missingDependencies).toHaveLength(0);
    });
  });

  describe('getMissingDependencies', () => {
    it('должен вернуть пустой массив когда все зависимости присутствуют', () => {
      const selected = [mockPermissions[0], mockPermissions[1], mockPermissions[2]];
      const missing = getMissingDependencies(selected);

      expect(missing).toHaveLength(0);
    });

    it('должен найти отсутствующую зависимость', () => {
      const selected = [mockPermissions[1]]; // WRITE_USERS без READ_USERS
      const missing = getMissingDependencies(selected);

      expect(missing).toHaveLength(1);
      expect(missing[0].missingDependencyId).toBe('1');
    });

    it('должен найти все отсутствующие зависимости для нескольких разрешений', () => {
      const selected = [mockPermissions[1], mockPermissions[2]]; // Оба без READ_USERS
      const missing = getMissingDependencies(selected);

      expect(missing.length).toBeGreaterThan(0);
      const uniqueMissing = new Set(missing.map((m) => m.missingDependencyId));
      expect(uniqueMissing.has('1')).toBe(true); // READ_USERS отсутствует
    });
  });

  describe('getPermissionsWithMissingDeps', () => {
    it('должен вернуть пустой Set когда все зависимости присутствуют', () => {
      const selected = [mockPermissions[0], mockPermissions[1]];
      const result = getPermissionsWithMissingDeps(selected);

      expect(result.size).toBe(0);
    });

    it('должен вернуть ID разрешений с отсутствующими зависимостями', () => {
      const selected = [mockPermissions[1]]; // WRITE_USERS без READ_USERS
      const result = getPermissionsWithMissingDeps(selected);

      expect(result.size).toBe(1);
      expect(result.has('2')).toBe(true); // WRITE_USERS имеет проблему
    });

    it('должен вернуть все разрешения с проблемами', () => {
      const selected = [mockPermissions[1], mockPermissions[2]]; // Оба без READ_USERS
      const result = getPermissionsWithMissingDeps(selected);

      expect(result.size).toBe(2);
      expect(result.has('2')).toBe(true); // WRITE_USERS
      expect(result.has('3')).toBe(true); // DELETE_USERS
    });
  });

  describe('hasAllDependencies', () => {
    it('должен вернуть true для разрешения без зависимостей', () => {
      const selected = [mockPermissions[0]];
      const result = hasAllDependencies(mockPermissions[0], selected);

      expect(result).toBe(true);
    });

    it('должен вернуть true когда все зависимости присутствуют', () => {
      const selected = [mockPermissions[0], mockPermissions[1]];
      const result = hasAllDependencies(mockPermissions[1], selected);

      expect(result).toBe(true);
    });

    it('должен вернуть false когда зависимость отсутствует', () => {
      const selected = [mockPermissions[1]]; // Только WRITE_USERS
      const result = hasAllDependencies(mockPermissions[1], selected);

      expect(result).toBe(false);
    });

    it('должен вернуть false когда отсутствует хотя бы одна зависимость', () => {
      const selected = [mockPermissions[0], mockPermissions[2]]; // READ и DELETE, но нет WRITE
      const result = hasAllDependencies(mockPermissions[2], selected);

      expect(result).toBe(false);
    });
  });
});
