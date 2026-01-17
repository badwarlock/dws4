import {
  PlatformPermissionInstance,
  PlatformPermissionDependencyInstance,
} from '../types/permissions';

/**
 * Добавляет разрешение и его зависимости в массив выбранных разрешений
 * @param permission - разрешение для добавления
 * @param allPermissions - полный список всех доступных разрешений
 * @param selectedPermissions - текущий массив выбранных разрешений
 * @returns новый массив выбранных разрешений
 */
function addPermissionWithDependencies(
  permission: PlatformPermissionInstance,
  allPermissions: Array<PlatformPermissionInstance>,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance> {
  const result = [...selectedPermissions];
  const toAdd: Array<PlatformPermissionInstance> = [];

  // Добавляем зависимости
  if (permission.dependencies && permission.dependencies.length > 0) {
    for (const dependency of permission.dependencies) {
      // Проверяем, не добавлена ли уже эта зависимость
      const alreadySelected = result.find((p) => p.id === dependency.id);
      const alreadyInToAdd = toAdd.find((p) => p.id === dependency.id);

      if (!alreadySelected && !alreadyInToAdd) {
        // Находим полную информацию о зависимости в оригинальном массиве
        const dependencyFull = allPermissions.find((p) => p.id === dependency.id);
        if (dependencyFull) {
          toAdd.push(dependencyFull);
        }
      }
    }
  }

  // Добавляем само разрешение, если его еще нет
  const alreadySelected = result.find((p) => p.id === permission.id);
  if (!alreadySelected) {
    toAdd.push(permission);
  }

  return [...result, ...toAdd];
}

/**
 * Удаляет разрешение и его зависимости из массива выбранных разрешений
 * Зависимость удаляется только если она больше не используется другими выбранными разрешениями
 * @param permission - разрешение для удаления
 * @param selectedPermissions - текущий массив выбранных разрешений
 * @returns новый массив выбранных разрешений
 */
function removePermissionWithDependencies(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance> {
  // Удаляем само разрешение
  let result = selectedPermissions.filter((p) => p.id !== permission.id);

  // Проверяем зависимости
  if (permission.dependencies && permission.dependencies.length > 0) {
    for (const dependency of permission.dependencies) {
      // Проверяем, используется ли эта зависимость другими выбранными разрешениями
      const isUsedByOthers = result.some((p) =>
        p.dependencies.some((dep) => dep.id === dependency.id)
      );

      // Если зависимость не используется другими разрешениями, удаляем её
      if (!isUsedByOthers) {
        result = result.filter((p) => p.id !== dependency.id);
      }
    }
  }

  return result;
}

/**
 * Переключает состояние выбранного разрешения (добавляет или удаляет)
 * @param permission - разрешение для переключения
 * @param allPermissions - полный список всех доступных разрешений
 * @param selectedPermissions - текущий массив выбранных разрешений
 * @returns новый массив выбранных разрешений
 */
export function togglePermission(
  permission: PlatformPermissionInstance,
  allPermissions: Array<PlatformPermissionInstance>,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance> {
  const isSelected = selectedPermissions.some((p) => p.id === permission.id);

  if (isSelected) {
    return removePermissionWithDependencies(permission, selectedPermissions);
  } else {
    return addPermissionWithDependencies(
      permission,
      allPermissions,
      selectedPermissions
    );
  }
}
