# Система управления разрешениями с зависимостями

Реализация логики выбора разрешений (permissions) с автоматическим управлением зависимостями.

## Описание

Данная система позволяет управлять выбором разрешений в UI с автоматической обработкой зависимостей:

- **При добавлении разрешения**: автоматически добавляются все его зависимости
- **При удалении разрешения**: зависимости удаляются только если они не используются другими выбранными разрешениями
- **Предотвращение дубликатов**: система автоматически исключает дублирование разрешений

## Структура проекта

```
src/
├── types/
│   └── permissions.ts              # TypeScript типы
├── utils/
│   ├── permissionsManager.ts       # Основная логика управления
│   └── __tests__/
│       └── permissionsManager.test.ts  # Тесты
├── hooks/
│   └── usePermissions.ts           # React хук для компонентов
├── components/
│   └── PermissionsList.tsx         # Компонент списка разрешений
└── examples/
    └── usage-example.tsx           # Пример использования
```

## Типы данных

### PlatformPermissionDependencyInstance

```typescript
type PlatformPermissionDependencyInstance = {
  id: string;
  code: string;
  name: string;
};
```

### PlatformPermissionInstance

```typescript
type PlatformPermissionInstance = {
  id: string;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  dependencies: Array<PlatformPermissionDependencyInstance>;
  created: string;
};
```

## Использование

### Вариант 1: Использование функции togglePermission

Для простых случаев или интеграции в существующий код:

```typescript
import { togglePermission } from './utils/permissionsManager';

const allPermissions = [...]; // ваш массив всех разрешений
let selectedPermissions = [];

// При клике на разрешение
const handleClick = (permission) => {
  selectedPermissions = togglePermission(
    permission,
    allPermissions,
    selectedPermissions
  );
};
```

### Вариант 2: Использование React хука

Для React компонентов:

```typescript
import { usePermissions } from './hooks/usePermissions';

function MyComponent({ allPermissions }) {
  const {
    selectedPermissions,
    handlePermissionClick,
    isPermissionSelected,
    clearSelectedPermissions,
  } = usePermissions(allPermissions);

  return (
    <div>
      {allPermissions.map((permission) => (
        <div
          key={permission.id}
          onClick={() => handlePermissionClick(permission)}
        >
          <input
            type="checkbox"
            checked={isPermissionSelected(permission.id)}
          />
          {permission.name}
        </div>
      ))}
    </div>
  );
}
```

### Вариант 3: Использование готового компонента

```typescript
import { PermissionsList } from './components/PermissionsList';

function App() {
  const allPermissions = [...]; // ваш массив

  const handleSelectionChange = (selected) => {
    console.log('Выбрано разрешений:', selected.length);
  };

  return (
    <PermissionsList
      allPermissions={allPermissions}
      onSelectionChange={handleSelectionChange}
    />
  );
}
```

## Примеры работы

### Пример 1: Добавление разрешения с зависимостями

```typescript
const permissions = [
  { id: '1', code: 'READ', dependencies: [] },
  { id: '2', code: 'WRITE', dependencies: [{ id: '1', code: 'READ' }] },
];

let selected = [];

// Выбираем WRITE
selected = togglePermission(permissions[1], permissions, selected);
// Результат: selected = [READ, WRITE]
// Автоматически добавился READ как зависимость
```

### Пример 2: Удаление с сохранением общих зависимостей

```typescript
const permissions = [
  { id: '1', code: 'READ', dependencies: [] },
  { id: '2', code: 'WRITE', dependencies: [{ id: '1', code: 'READ' }] },
  {
    id: '3',
    code: 'DELETE',
    dependencies: [
      { id: '1', code: 'READ' },
      { id: '2', code: 'WRITE' },
    ],
  },
];

// Выбираем DELETE (добавятся READ, WRITE, DELETE)
let selected = togglePermission(permissions[2], permissions, []);
// selected = [READ, WRITE, DELETE]

// Удаляем WRITE
selected = togglePermission(permissions[1], permissions, selected);
// Результат: selected = [READ, DELETE]
// READ остался, т.к. используется в DELETE
// WRITE удален
```

### Пример 3: Предотвращение дубликатов

```typescript
// Добавляем READ
let selected = togglePermission(permissions[0], permissions, []);
// selected = [READ]

// Добавляем WRITE (зависит от READ)
selected = togglePermission(permissions[1], permissions, selected);
// selected = [READ, WRITE]
// READ не продублирован, хотя является зависимостью WRITE
```

## Логика работы

### При добавлении разрешения:

1. Проверяются зависимости выбранного разрешения
2. Каждая зависимость ищется в полном списке разрешений (`allPermissions`)
3. Зависимость добавляется в `selectedPermissions`, если её там еще нет
4. Добавляется само выбранное разрешение

### При удалении разрешения:

1. Удаляется само разрешение из `selectedPermissions`
2. Для каждой зависимости удаляемого разрешения проверяется:
   - Используется ли эта зависимость другими разрешениями в `selectedPermissions`
3. Если зависимость не используется — она удаляется
4. Если зависимость используется — она остается в списке

## API

### togglePermission

```typescript
function togglePermission(
  permission: PlatformPermissionInstance,
  allPermissions: Array<PlatformPermissionInstance>,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance>;
```

**Параметры:**

- `permission` - разрешение для переключения
- `allPermissions` - полный список всех доступных разрешений
- `selectedPermissions` - текущий массив выбранных разрешений

**Возвращает:** новый массив выбранных разрешений

### usePermissions

```typescript
function usePermissions(
  allPermissions: Array<PlatformPermissionInstance>,
  initialSelected?: Array<PlatformPermissionInstance>
): {
  selectedPermissions: Array<PlatformPermissionInstance>;
  handlePermissionClick: (permission: PlatformPermissionInstance) => void;
  isPermissionSelected: (permissionId: string) => boolean;
  clearSelectedPermissions: () => void;
  setSelectedPermissions: (
    permissions: Array<PlatformPermissionInstance>
  ) => void;
};
```

**Параметры:**

- `allPermissions` - полный список всех доступных разрешений
- `initialSelected` - начальный список выбранных разрешений (опционально)

**Возвращает:** объект с методами и состоянием для управления разрешениями

## Тестирование

Запуск тестов:

```bash
npm test
```

Тесты покрывают следующие сценарии:

- ✅ Добавление разрешения без зависимостей
- ✅ Добавление разрешения с зависимостями
- ✅ Добавление разрешения с множественными зависимостями
- ✅ Предотвращение дубликатов
- ✅ Удаление разрешения без зависимостей
- ✅ Удаление разрешения и его неиспользуемых зависимостей
- ✅ Сохранение зависимостей, используемых другими разрешениями
- ✅ Переключение туда-обратно

## Особенности реализации

1. **Иммутабельность**: все функции возвращают новые массивы, не изменяя исходные
2. **Производительность**: используются эффективные алгоритмы поиска и фильтрации
3. **Type Safety**: полная типизация TypeScript
4. **React-friendly**: хуки используют `useCallback` для оптимизации
5. **Тестируемость**: чистые функции, легко покрываются тестами

## Лицензия

MIT
