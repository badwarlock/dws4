import React from 'react';
import { PermissionsList } from '../components/PermissionsList';
import { PlatformPermissionInstance } from '../types/permissions';

/**
 * Пример использования компонента PermissionsList
 */
export const PermissionsExample: React.FC = () => {
  // Пример данных с разрешениями и зависимостями
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
    {
      id: '4',
      code: 'READ_REPORTS',
      name: 'Чтение отчетов',
      description: 'Позволяет просматривать отчеты',
      is_active: true,
      dependencies: [],
      created: '2025-01-01T00:00:00Z',
    },
    {
      id: '5',
      code: 'ADMIN_PANEL',
      name: 'Доступ к админ-панели',
      description: 'Полный доступ к административной панели',
      is_active: false,
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
        {
          id: '3',
          code: 'DELETE_USERS',
          name: 'Удаление пользователей',
        },
      ],
      created: '2025-01-01T00:00:00Z',
    },
  ];

  const handleSelectionChange = (
    selected: Array<PlatformPermissionInstance>
  ) => {
    console.log('Выбранные разрешения:', selected);
    console.log(
      'Коды выбранных разрешений:',
      selected.map((p) => p.code)
    );
  };

  return (
    <div className="app">
      <h1>Управление разрешениями</h1>
      <PermissionsList
        allPermissions={mockPermissions}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
};
