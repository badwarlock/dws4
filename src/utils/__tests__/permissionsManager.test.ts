import { togglePermission } from '../permissionsManager';
import { PlatformPermissionInstance } from '../../types/permissions';

describe('permissionsManager', () => {
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
    it('должен добавить разрешение без зависимостей', () => {
      const result = togglePermission(mockPermissions[0], mockPermissions, []);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('должен добавить разрешение с зависимостями', () => {
      const result = togglePermission(mockPermissions[1], mockPermissions, []);

      expect(result).toHaveLength(2);
      expect(result.find((p) => p.id === '1')).toBeDefined(); // зависимость
      expect(result.find((p) => p.id === '2')).toBeDefined(); // само разрешение
    });

    it('должен добавить разрешение с множественными зависимостями', () => {
      const result = togglePermission(mockPermissions[2], mockPermissions, []);

      expect(result).toHaveLength(3);
      expect(result.find((p) => p.id === '1')).toBeDefined(); // зависимость
      expect(result.find((p) => p.id === '2')).toBeDefined(); // зависимость
      expect(result.find((p) => p.id === '3')).toBeDefined(); // само разрешение
    });

    it('не должен добавлять дубликаты при добавлении разрешения с уже существующими зависимостями', () => {
      // Сначала добавим READ_USERS
      let result = togglePermission(mockPermissions[0], mockPermissions, []);
      expect(result).toHaveLength(1);

      // Теперь добавим WRITE_USERS, который зависит от READ_USERS
      result = togglePermission(mockPermissions[1], mockPermissions, result);
      expect(result).toHaveLength(2);

      // Проверяем, что READ_USERS встречается только один раз
      const readUsersCount = result.filter((p) => p.id === '1').length;
      expect(readUsersCount).toBe(1);
    });

    it('должен удалить разрешение без зависимостей', () => {
      const selected = [mockPermissions[0]];
      const result = togglePermission(
        mockPermissions[0],
        mockPermissions,
        selected
      );

      expect(result).toHaveLength(0);
    });

    it('должен удалить разрешение и его зависимости, если они не используются другими', () => {
      // Добавим WRITE_USERS (который добавит и READ_USERS)
      let selected = togglePermission(mockPermissions[1], mockPermissions, []);
      expect(selected).toHaveLength(2);

      // Удалим WRITE_USERS
      selected = togglePermission(
        mockPermissions[1],
        mockPermissions,
        selected
      );

      // Должны быть удалены оба: WRITE_USERS и READ_USERS
      expect(selected).toHaveLength(0);
    });

    it('должен каскадно удалить разрешения, которые зависят от удаляемого', () => {
      // Добавим WRITE_USERS (добавятся READ_USERS и WRITE_USERS)
      let selected = togglePermission(mockPermissions[1], mockPermissions, []);
      expect(selected).toHaveLength(2);

      // Добавим DELETE_USERS (добавится DELETE_USERS, READ_USERS и WRITE_USERS уже есть)
      selected = togglePermission(mockPermissions[2], mockPermissions, selected);
      expect(selected).toHaveLength(3);

      // Удалим WRITE_USERS
      // Каскадно должен удалиться DELETE_USERS (т.к. он зависит от WRITE_USERS)
      selected = togglePermission(
        mockPermissions[1],
        mockPermissions,
        selected
      );

      // Должен остаться только READ_USERS
      expect(selected).toHaveLength(1);
      expect(selected.find((p) => p.id === '1')).toBeDefined(); // READ_USERS
      expect(selected.find((p) => p.id === '2')).toBeUndefined(); // WRITE_USERS удален
      expect(selected.find((p) => p.id === '3')).toBeUndefined(); // DELETE_USERS удален каскадно
    });

    it('должен каскадно удалить все зависимые разрешения при удалении корневой зависимости', () => {
      // Добавим DELETE_USERS (добавятся READ_USERS, WRITE_USERS и DELETE_USERS)
      let selected = togglePermission(mockPermissions[2], mockPermissions, []);
      expect(selected).toHaveLength(3);

      // Удалим READ_USERS (корневая зависимость)
      // Каскадно должны удалиться WRITE_USERS и DELETE_USERS
      selected = togglePermission(
        mockPermissions[0],
        mockPermissions,
        selected
      );

      // Все должны быть удалены
      expect(selected).toHaveLength(0);
    });

    it('должен корректно работать с переключением туда-обратно', () => {
      let selected: Array<PlatformPermissionInstance> = [];

      // Добавляем
      selected = togglePermission(mockPermissions[1], mockPermissions, selected);
      expect(selected).toHaveLength(2);

      // Удаляем
      selected = togglePermission(mockPermissions[1], mockPermissions, selected);
      expect(selected).toHaveLength(0);

      // Снова добавляем
      selected = togglePermission(mockPermissions[1], mockPermissions, selected);
      expect(selected).toHaveLength(2);
    });
  });
});
