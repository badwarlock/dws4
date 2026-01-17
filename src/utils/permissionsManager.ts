import {
  PlatformPermissionInstance,
  PlatformPermissionDependencyInstance,
} from '../types/permissions';

/**
 * Простое переключение выбора разрешения (добавление или удаление)
 * Без автоматического управления зависимостями
 *
 * @param permission - разрешение для переключения
 * @param selectedPermissions - текущий массив выбранных разрешений
 * @returns новый массив выбранных разрешений
 */
export function togglePermission(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance> {
  const isSelected = selectedPermissions.some((p) => p.id === permission.id);

  if (isSelected) {
    // Удаляем разрешение
    return selectedPermissions.filter((p) => p.id !== permission.id);
  } else {
    // Добавляем разрешение
    return [...selectedPermissions, permission];
  }
}
