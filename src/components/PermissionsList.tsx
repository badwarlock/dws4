import React from 'react';
import { PlatformPermissionInstance } from '../types/permissions';
import { usePermissions } from '../hooks/usePermissions';
import './PermissionsList.css';

interface PermissionsListProps {
  allPermissions: Array<PlatformPermissionInstance>;
  initialSelected?: Array<PlatformPermissionInstance>;
  onSelectionChange?: (selected: Array<PlatformPermissionInstance>) => void;
}

/**
 * Компонент для отображения списка разрешений с поддержкой выбора
 * Автоматически управляет зависимостями при выборе/отмене выбора
 */
export const PermissionsList: React.FC<PermissionsListProps> = ({
  allPermissions,
  initialSelected = [],
  onSelectionChange,
}) => {
  const {
    selectedPermissions,
    handlePermissionClick,
    isPermissionSelected,
    clearSelectedPermissions,
  } = usePermissions(allPermissions, initialSelected);

  // Вызываем колбэк при изменении выбора
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedPermissions);
    }
  }, [selectedPermissions, onSelectionChange]);

  return (
    <div className="permissions-list">
      <div className="permissions-header">
        <h2>Разрешения</h2>
        <button onClick={clearSelectedPermissions}>Очистить выбор</button>
        <div className="selected-count">
          Выбрано: {selectedPermissions.length}
        </div>
      </div>

      <div className="permissions-items">
        {allPermissions.map((permission) => {
          const isSelected = isPermissionSelected(permission.id);
          const hasDependencies =
            permission.dependencies && permission.dependencies.length > 0;

          return (
            <div
              key={permission.id}
              className={`permission-item ${isSelected ? 'selected' : ''} ${
                !permission.is_active ? 'inactive' : ''
              }`}
              onClick={() => handlePermissionClick(permission)}
            >
              <div className="permission-main">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="permission-info">
                  <h3>{permission.name}</h3>
                  <p className="permission-code">{permission.code}</p>
                  <p className="permission-description">
                    {permission.description}
                  </p>
                </div>
              </div>

              {hasDependencies && (
                <div className="permission-dependencies">
                  <span className="dependencies-label">Зависимости:</span>
                  <ul>
                    {permission.dependencies.map((dep) => (
                      <li key={dep.id}>
                        {dep.name} ({dep.code})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="selected-permissions">
        <h3>Выбранные разрешения:</h3>
        {selectedPermissions.length === 0 ? (
          <p>Ничего не выбрано</p>
        ) : (
          <ul>
            {selectedPermissions.map((permission) => (
              <li key={permission.id}>
                {permission.name} ({permission.code})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
