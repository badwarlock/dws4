// Экспорт типов
export type {
  PlatformPermissionInstance,
  PlatformPermissionDependencyInstance,
} from './types/permissions';

// Экспорт утилит
export { togglePermission } from './utils/permissionsManager';

// Экспорт хуков
export { usePermissions } from './hooks/usePermissions';

// Экспорт компонентов
export { PermissionsList } from './components/PermissionsList';
