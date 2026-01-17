import { useState, useCallback } from 'react';
import { PlatformPermissionInstance } from '../types/permissions';
import { togglePermission } from '../utils/permissionsManager';

/**
 * Хук для управления выбором разрешений с учетом зависимостей
 * @param allPermissions - полный список всех доступных разрешений
 * @param initialSelected - начальный список выбранных разрешений
 */
export function usePermissions(
  allPermissions: Array<PlatformPermissionInstance>,
  initialSelected: Array<PlatformPermissionInstance> = []
) {
  const [selectedPermissions, setSelectedPermissions] =
    useState<Array<PlatformPermissionInstance>>(initialSelected);

  /**
   * Обработчик клика на разрешение
   * Добавляет или удаляет разрешение вместе с его зависимостями
   */
  const handlePermissionClick = useCallback(
    (permission: PlatformPermissionInstance) => {
      setSelectedPermissions((current) =>
        togglePermission(permission, allPermissions, current)
      );
    },
    [allPermissions]
  );

  /**
   * Проверяет, выбрано ли разрешение
   */
  const isPermissionSelected = useCallback(
    (permissionId: string): boolean => {
      return selectedPermissions.some((p) => p.id === permissionId);
    },
    [selectedPermissions]
  );

  /**
   * Очищает все выбранные разрешения
   */
  const clearSelectedPermissions = useCallback(() => {
    setSelectedPermissions([]);
  }, []);

  /**
   * Устанавливает выбранные разрешения
   */
  const setSelected = useCallback(
    (permissions: Array<PlatformPermissionInstance>) => {
      setSelectedPermissions(permissions);
    },
    []
  );

  return {
    selectedPermissions,
    handlePermissionClick,
    isPermissionSelected,
    clearSelectedPermissions,
    setSelectedPermissions: setSelected,
  };
}
