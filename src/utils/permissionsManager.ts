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
 * Удаляет разрешение из массива выбранных разрешений с каскадным удалением
 *
 * Логика удаления:
 * 1. Удаляется само разрешение
 * 2. Каскадно удаляются все разрешения, которые зависят от удаляемого
 * 3. Удаляются зависимости удаленных разрешений, если они больше не используются
 *
 * @param permission - разрешение для удаления
 * @param selectedPermissions - текущий массив выбранных разрешений
 * @returns новый массив выбранных разрешений
 */
function removePermissionWithDependencies(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance> {
  const idsToRemove = new Set<string>();

  // Рекурсивная функция для поиска всех разрешений, которые зависят от данного
  function collectDependentPermissions(permId: string) {
    idsToRemove.add(permId);

    // Находим все разрешения, которые зависят от permId
    selectedPermissions.forEach((p) => {
      if (p.dependencies.some((dep) => dep.id === permId) && !idsToRemove.has(p.id)) {
        collectDependentPermissions(p.id);
      }
    });
  }

  // Собираем все разрешения для удаления (само разрешение + все что от него зависит)
  collectDependentPermissions(permission.id);

  // Удаляем все собранные разрешения
  let result = selectedPermissions.filter((p) => !idsToRemove.has(p.id));

  // Теперь для КАЖДОГО удаленного разрешения проверяем его зависимости
  // и удаляем их, если они больше не используются оставшимися разрешениями
  const removedPermissions = selectedPermissions.filter((p) => idsToRemove.has(p.id));

  removedPermissions.forEach((removedPerm) => {
    if (removedPerm.dependencies && removedPerm.dependencies.length > 0) {
      removedPerm.dependencies.forEach((dependency) => {
        // Проверяем, используется ли эта зависимость оставшимися разрешениями
        const isUsedByRemaining = result.some((p) =>
          p.dependencies.some((dep) => dep.id === dependency.id)
        );

        if (!isUsedByRemaining) {
          result = result.filter((p) => p.id !== dependency.id);
        }
      });
    }
  });

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
