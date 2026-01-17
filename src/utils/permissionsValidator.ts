import Joi from 'joi';
import { PlatformPermissionInstance } from '../types/permissions';

/**
 * Информация об отсутствующей зависимости
 */
export interface MissingDependency {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  missingDependencyId: string;
  missingDependencyCode: string;
  missingDependencyName: string;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  missingDependencies: Array<MissingDependency>;
  error?: Joi.ValidationError;
}

/**
 * Проверяет наличие всех зависимостей у выбранных разрешений
 *
 * @param selectedPermissions - массив выбранных разрешений для валидации
 * @returns информация об отсутствующих зависимостях
 */
export function getMissingDependencies(
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<MissingDependency> {
  const missingDeps: Array<MissingDependency> = [];
  const selectedIds = new Set(selectedPermissions.map((p) => p.id));

  selectedPermissions.forEach((permission) => {
    if (permission.dependencies && permission.dependencies.length > 0) {
      permission.dependencies.forEach((dependency) => {
        if (!selectedIds.has(dependency.id)) {
          missingDeps.push({
            permissionId: permission.id,
            permissionCode: permission.code,
            permissionName: permission.name,
            missingDependencyId: dependency.id,
            missingDependencyCode: dependency.code,
            missingDependencyName: dependency.name,
          });
        }
      });
    }
  });

  return missingDeps;
}

/**
 * Custom Joi валидатор для проверки зависимостей
 */
const dependenciesValidator = (
  value: Array<PlatformPermissionInstance>,
  helpers: Joi.CustomHelpers
) => {
  const missingDeps = getMissingDependencies(value);

  if (missingDeps.length > 0) {
    return helpers.error('permissions.missingDependencies', {
      missingDependencies: missingDeps,
    });
  }

  return value;
};

/**
 * Joi схема для валидации массива разрешений
 * Проверяет что все зависимости выбранных разрешений присутствуют в массиве
 */
export const permissionsSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      code: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      is_active: Joi.boolean().required(),
      dependencies: Joi.array()
        .items(
          Joi.object({
            id: Joi.string().required(),
            code: Joi.string().required(),
            name: Joi.string().required(),
          })
        )
        .required(),
      created: Joi.string().required(),
    })
  )
  .custom(dependenciesValidator, 'dependencies validation')
  .messages({
    'permissions.missingDependencies':
      'У некоторых разрешений отсутствуют необходимые зависимости',
  });

/**
 * Валидирует массив выбранных разрешений
 *
 * @param selectedPermissions - массив для валидации
 * @returns результат валидации с подробной информацией об ошибках
 */
export function validatePermissions(
  selectedPermissions: Array<PlatformPermissionInstance>
): ValidationResult {
  const { error, value } = permissionsSchema.validate(selectedPermissions, {
    abortEarly: false,
  });

  const missingDependencies = getMissingDependencies(selectedPermissions);

  return {
    isValid: !error && missingDependencies.length === 0,
    missingDependencies,
    error,
  };
}

/**
 * Получает список разрешений с проблемами (отсутствующими зависимостями)
 *
 * @param selectedPermissions - массив выбранных разрешений
 * @returns массив ID разрешений, у которых отсутствуют зависимости
 */
export function getPermissionsWithMissingDeps(
  selectedPermissions: Array<PlatformPermissionInstance>
): Set<string> {
  const missingDeps = getMissingDependencies(selectedPermissions);
  return new Set(missingDeps.map((dep) => dep.permissionId));
}

/**
 * Проверяет конкретное разрешение на наличие всех его зависимостей
 *
 * @param permission - разрешение для проверки
 * @param selectedPermissions - массив всех выбранных разрешений
 * @returns true если все зависимости присутствуют
 */
export function hasAllDependencies(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): boolean {
  if (!permission.dependencies || permission.dependencies.length === 0) {
    return true;
  }

  const selectedIds = new Set(selectedPermissions.map((p) => p.id));

  return permission.dependencies.every((dep) => selectedIds.has(dep.id));
}
