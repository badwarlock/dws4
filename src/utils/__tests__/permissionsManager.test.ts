import { togglePermission } from '../permissionsManager';
import { PlatformPermissionInstance } from '../../types/permissions';

describe('permissionsManager - Simple Toggle', () => {
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

  describe('togglePermission', () => {
    it('должен добавить разрешение в пустой массив', () => {
      const result = togglePermission(mockPermissions[0], []);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('НЕ должен автоматически добавлять зависимости', () => {
      // Добавляем WRITE_USERS который зависит от READ_USERS
      const result = togglePermission(mockPermissions[1], []);

      // Должен быть добавлен ТОЛЬКО WRITE_USERS без READ_USERS
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
      expect(result.find((p) => p.id === '1')).toBeUndefined(); // READ_USERS НЕ добавлен
    });

    it('должен добавить разрешение с множественными зависимостями БЕЗ автодобавления зависимостей', () => {
      const result = togglePermission(mockPermissions[2], []);

      // Должен быть добавлен ТОЛЬКО DELETE_USERS
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
      expect(result.find((p) => p.id === '1')).toBeUndefined(); // READ_USERS НЕ добавлен
      expect(result.find((p) => p.id === '2')).toBeUndefined(); // WRITE_USERS НЕ добавлен
    });

    it('не должен добавлять дубликаты', () => {
      // Добавляем READ_USERS
      let result = togglePermission(mockPermissions[0], []);
      expect(result).toHaveLength(1);

      // Пытаемся добавить READ_USERS снова
      result = togglePermission(mockPermissions[0], result);

      // Должен удалиться (toggle)
      expect(result).toHaveLength(0);
    });

    it('должен удалить разрешение', () => {
      const selected = [mockPermissions[0]];
      const result = togglePermission(mockPermissions[0], selected);

      expect(result).toHaveLength(0);
    });

    it('НЕ должен каскадно удалять зависимые разрешения', () => {
      // Выбираем все три разрешения вручную
      let selected = [mockPermissions[0], mockPermissions[1], mockPermissions[2]];

      // Удаляем WRITE_USERS
      selected = togglePermission(mockPermissions[1], selected);

      // Должен остаться READ_USERS и DELETE_USERS
      // DELETE_USERS НЕ удаляется каскадно (это обязанность валидации)
      expect(selected).toHaveLength(2);
      expect(selected.find((p) => p.id === '1')).toBeDefined(); // READ_USERS
      expect(selected.find((p) => p.id === '2')).toBeUndefined(); // WRITE_USERS удален
      expect(selected.find((p) => p.id === '3')).toBeDefined(); // DELETE_USERS остался (!)
    });

    it('НЕ должен удалять зависимости при удалении разрешения', () => {
      // Выбираем READ_USERS и WRITE_USERS вручную
      let selected = [mockPermissions[0], mockPermissions[1]];

      // Удаляем WRITE_USERS
      selected = togglePermission(mockPermissions[1], selected);

      // Должен остаться READ_USERS (НЕ удаляется вместе с WRITE_USERS)
      expect(selected).toHaveLength(1);
      expect(selected.find((p) => p.id === '1')).toBeDefined(); // READ_USERS остался
    });

    it('должен корректно работать с переключением туда-обратно', () => {
      let selected: Array<PlatformPermissionInstance> = [];

      // Добавляем
      selected = togglePermission(mockPermissions[0], selected);
      expect(selected).toHaveLength(1);

      // Удаляем
      selected = togglePermission(mockPermissions[0], selected);
      expect(selected).toHaveLength(0);

      // Снова добавляем
      selected = togglePermission(mockPermissions[0], selected);
      expect(selected).toHaveLength(1);
    });

    it('должен работать с множественными разрешениями', () => {
      let selected: Array<PlatformPermissionInstance> = [];

      // Добавляем разрешения по одному
      selected = togglePermission(mockPermissions[0], selected);
      expect(selected).toHaveLength(1);

      selected = togglePermission(mockPermissions[1], selected);
      expect(selected).toHaveLength(2);

      selected = togglePermission(mockPermissions[2], selected);
      expect(selected).toHaveLength(3);

      // Удаляем среднее
      selected = togglePermission(mockPermissions[1], selected);
      expect(selected).toHaveLength(2);
      expect(selected.find((p) => p.id === '1')).toBeDefined();
      expect(selected.find((p) => p.id === '2')).toBeUndefined();
      expect(selected.find((p) => p.id === '3')).toBeDefined();
    });
  });
});
