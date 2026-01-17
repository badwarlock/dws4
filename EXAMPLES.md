# Примеры использования

## Сценарий 1: Базовое использование

### Исходные данные

```javascript
const permissions = [
  {
    id: '1',
    code: 'VIEW_DASHBOARD',
    name: 'Просмотр дашборда',
    description: 'Базовый доступ к дашборду',
    is_active: true,
    dependencies: [],
    created: '2025-01-01T00:00:00Z',
  },
];
```

### Действия пользователя

1. Клик на разрешение "VIEW_DASHBOARD"

### Результат

```javascript
selectedPermissions = [
  {
    id: '1',
    code: 'VIEW_DASHBOARD',
    name: 'Просмотр дашборда',
    // ...
  },
];
```

---

## Сценарий 2: Выбор разрешения с зависимостями

### Исходные данные

```javascript
const permissions = [
  {
    id: '1',
    code: 'READ_USERS',
    name: 'Чтение пользователей',
    dependencies: [],
    // ...
  },
  {
    id: '2',
    code: 'EDIT_USERS',
    name: 'Редактирование пользователей',
    dependencies: [{ id: '1', code: 'READ_USERS', name: 'Чтение пользователей' }],
    // ...
  },
];
```

### Действия пользователя

1. Клик на разрешение "EDIT_USERS"

### Результат

```javascript
selectedPermissions = [
  { id: '1', code: 'READ_USERS', name: 'Чтение пользователей' },
  { id: '2', code: 'EDIT_USERS', name: 'Редактирование пользователей' },
];
// Автоматически добавлено READ_USERS как зависимость
```

---

## Сценарий 3: Множественные зависимости

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'READ_USERS', dependencies: [] },
  { id: '2', code: 'EDIT_USERS', dependencies: [{ id: '1' }] },
  {
    id: '3',
    code: 'DELETE_USERS',
    dependencies: [{ id: '1' }, { id: '2' }],
  },
];
```

### Действия пользователя

1. Клик на разрешение "DELETE_USERS"

### Результат

```javascript
selectedPermissions = [
  { id: '1', code: 'READ_USERS' },
  { id: '2', code: 'EDIT_USERS' },
  { id: '3', code: 'DELETE_USERS' },
];
// Добавлены все зависимости: READ_USERS и EDIT_USERS
```

---

## Сценарий 4: Предотвращение дубликатов

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'READ_USERS', dependencies: [] },
  { id: '2', code: 'EDIT_USERS', dependencies: [{ id: '1' }] },
  { id: '3', code: 'DELETE_USERS', dependencies: [{ id: '1' }] },
];

let selectedPermissions = [];
```

### Действия пользователя

1. Клик на "EDIT_USERS"
2. Клик на "DELETE_USERS"

### Пошаговый результат

После шага 1:

```javascript
selectedPermissions = [
  { id: '1', code: 'READ_USERS' },
  { id: '2', code: 'EDIT_USERS' },
];
```

После шага 2:

```javascript
selectedPermissions = [
  { id: '1', code: 'READ_USERS' }, // Не продублирован!
  { id: '2', code: 'EDIT_USERS' },
  { id: '3', code: 'DELETE_USERS' },
];
```

---

## Сценарий 5: Умное удаление зависимостей

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'READ_USERS', dependencies: [] },
  { id: '2', code: 'EDIT_USERS', dependencies: [{ id: '1' }] },
  { id: '3', code: 'DELETE_USERS', dependencies: [{ id: '1' }, { id: '2' }] },
];

let selectedPermissions = [
  { id: '1', code: 'READ_USERS' },
  { id: '2', code: 'EDIT_USERS' },
  { id: '3', code: 'DELETE_USERS' },
];
```

### Действия пользователя

1. Клик на "EDIT_USERS" (для удаления)

### Результат

```javascript
selectedPermissions = [
  { id: '1', code: 'READ_USERS' }, // Остался! Используется в DELETE_USERS
  { id: '3', code: 'DELETE_USERS' },
];
// EDIT_USERS удален
// READ_USERS остался, т.к. используется в DELETE_USERS
```

---

## Сценарий 6: Полная очистка зависимостей

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'READ_USERS', dependencies: [] },
  { id: '2', code: 'EDIT_USERS', dependencies: [{ id: '1' }] },
];

let selectedPermissions = [
  { id: '1', code: 'READ_USERS' },
  { id: '2', code: 'EDIT_USERS' },
];
```

### Действия пользователя

1. Клик на "EDIT_USERS" (для удаления)

### Результат

```javascript
selectedPermissions = [];
// EDIT_USERS удален
// READ_USERS тоже удален, т.к. больше не используется
```

---

## Сценарий 7: Сложная цепочка зависимостей

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'BASE', dependencies: [] },
  { id: '2', code: 'LEVEL_1', dependencies: [{ id: '1' }] },
  { id: '3', code: 'LEVEL_2', dependencies: [{ id: '2' }] },
  { id: '4', code: 'LEVEL_3', dependencies: [{ id: '3' }] },
];
```

### Действия пользователя

1. Клик на "LEVEL_3"

### Результат

```javascript
selectedPermissions = [
  { id: '3', code: 'LEVEL_2' },
  { id: '4', code: 'LEVEL_3' },
];
// ВАЖНО: Добавляются только прямые зависимости!
// Система не разворачивает цепочку зависимостей рекурсивно
```

---

## Сценарий 8: Работа с неактивными разрешениями

### Исходные данные

```javascript
const permissions = [
  { id: '1', code: 'ACTIVE_PERM', is_active: true, dependencies: [] },
  { id: '2', code: 'INACTIVE_PERM', is_active: false, dependencies: [] },
];
```

### Действия пользователя

1. Клик на "INACTIVE_PERM"

### Результат

```javascript
selectedPermissions = [{ id: '2', code: 'INACTIVE_PERM', is_active: false }];
// Неактивное разрешение можно выбрать (логика не блокирует)
// Отображение в UI может визуально отличаться (opacity: 0.6)
```

---

## Интеграция с формами

### Пример: Форма создания роли

```typescript
import React, { useState } from 'react';
import { usePermissions } from './hooks/usePermissions';

function CreateRoleForm({ allPermissions }) {
  const [roleName, setRoleName] = useState('');
  const { selectedPermissions, handlePermissionClick, isPermissionSelected } =
    usePermissions(allPermissions);

  const handleSubmit = (e) => {
    e.preventDefault();

    const role = {
      name: roleName,
      permissions: selectedPermissions.map((p) => p.id),
    };

    console.log('Создание роли:', role);
    // Отправка на сервер
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        placeholder="Название роли"
      />

      <div>
        {allPermissions.map((permission) => (
          <label key={permission.id}>
            <input
              type="checkbox"
              checked={isPermissionSelected(permission.id)}
              onChange={() => handlePermissionClick(permission)}
            />
            {permission.name}
          </label>
        ))}
      </div>

      <button type="submit">Создать роль</button>
    </form>
  );
}
```

## Диаграмма работы

```
┌─────────────────────────────────────────────────────────────┐
│                    Клик на разрешение                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Выбрано?     │
              └───┬───────┬───┘
                  │       │
           Нет ───┘       └─── Да
            │                   │
            ▼                   ▼
    ┌───────────────┐   ┌──────────────────┐
    │  ДОБАВЛЕНИЕ   │   │    УДАЛЕНИЕ      │
    └───────┬───────┘   └────────┬─────────┘
            │                    │
            ▼                    ▼
    ┌──────────────┐     ┌─────────────────┐
    │ Найти все    │     │ Удалить         │
    │ зависимости  │     │ разрешение      │
    └──────┬───────┘     └────────┬────────┘
           │                      │
           ▼                      ▼
    ┌──────────────┐     ┌─────────────────┐
    │ Добавить     │     │ Для каждой      │
    │ зависимости  │     │ зависимости:    │
    │ (без дублей) │     │ используется?   │
    └──────┬───────┘     └────────┬────────┘
           │                      │
           ▼                      ├─── Да: оставить
    ┌──────────────┐              │
    │ Добавить     │              └─── Нет: удалить
    │ разрешение   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────┐
    │ selectedPermissions      │
    │ обновлен                 │
    └──────────────────────────┘
```
