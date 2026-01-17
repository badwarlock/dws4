# Система управления разрешениями - Простой Toggle + Валидация

Это альтернативная реализация системы управления разрешениями с разделением concerns:
- **UI логика** - простой toggle (добавить/удалить разрешение)
- **Валидация** - Joi схема проверяет целостность данных

## Философия подхода

### Принцип разделения ответственности

**UI не навязывает поведение** → пользователь сам управляет выбором
**Валидация проверяет** → перед сохранением показывает ошибки

### Сравнение подходов

| Аспект | Автоматическое управление (main ветка) | Простой toggle + Валидация (эта ветка) |
|--------|----------------------------------------|------------------------------------------|
| **Toggle логика** | Автоматически добавляет/удаляет зависимости | Просто add/remove без побочных эффектов |
| **Сложность UI** | Сложная, рекурсивная логика | Простая, понятная |
| **Предсказуемость** | Может удивить пользователя | Полностью предсказуемо |
| **Когда проверка** | В runtime при каждом клике | При валидации/сохранении |
| **Исправление ошибок** | Сложно - нужно понимать каскады | Легко - просто добавь недостающее |
| **Гибкость** | Ограничена автоматикой | Полный контроль |

## Структура проекта

```
src/
├── types/
│   └── permissions.ts              # TypeScript типы
├── utils/
│   ├── permissionsManager.ts       # Простая toggle логика
│   ├── permissionsValidator.ts     # Joi валидация + хелперы
│   └── __tests__/
│       ├── permissionsManager.test.ts       # Тесты toggle
│       └── permissionsValidator.test.ts     # Тесты валидации
└── demos/
    └── demo-simple.html            # Демо с валидацией
```

## API

### togglePermission

Простое переключение выбора разрешения без побочных эффектов.

```typescript
function togglePermission(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<PlatformPermissionInstance>;
```

**Пример:**
```typescript
let selected = [];

// Добавляем WRITE_USERS (который зависит от READ_USERS)
selected = togglePermission(writeUsers, selected);
// selected = [writeUsers]  ← Только WRITE, READ не добавлен автоматически!

// Добавляем READ_USERS вручную
selected = togglePermission(readUsers, selected);
// selected = [writeUsers, readUsers]  ← Теперь оба выбраны
```

### validatePermissions

Проверяет что все зависимости выбранных разрешений присутствуют.

```typescript
function validatePermissions(
  selectedPermissions: Array<PlatformPermissionInstance>
): ValidationResult;

interface ValidationResult {
  isValid: boolean;
  missingDependencies: Array<MissingDependency>;
  error?: Joi.ValidationError;
}
```

**Пример:**
```typescript
const selected = [writeUsers]; // WRITE зависит от READ, но READ не выбран

const validation = validatePermissions(selected);
// validation.isValid === false
// validation.missingDependencies = [{
//   permissionCode: 'WRITE_USERS',
//   missingDependencyCode: 'READ_USERS',
//   ...
// }]
```

### Хелперы

#### getMissingDependencies

Возвращает детальную информацию об отсутствующих зависимостях:

```typescript
function getMissingDependencies(
  selectedPermissions: Array<PlatformPermissionInstance>
): Array<MissingDependency>;
```

#### getPermissionsWithMissingDeps

Возвращает Set с ID разрешений, у которых отсутствуют зависимости:

```typescript
function getPermissionsWithMissingDeps(
  selectedPermissions: Array<PlatformPermissionInstance>
): Set<string>;
```

#### hasAllDependencies

Проверяет конкретное разрешение:

```typescript
function hasAllDependencies(
  permission: PlatformPermissionInstance,
  selectedPermissions: Array<PlatformPermissionInstance>
): boolean;
```

## Использование

### Базовый пример

```typescript
import { togglePermission } from './utils/permissionsManager';
import { validatePermissions } from './utils/permissionsValidator';

let selected = [];

// Пользователь выбирает разрешения
selected = togglePermission(permission1, selected);
selected = togglePermission(permission2, selected);

// Перед сохранением - валидация
const validation = validatePermissions(selected);

if (validation.isValid) {
  // Сохраняем
  await savePermissions(selected);
} else {
  // Показываем ошибки
  validation.missingDependencies.forEach(dep => {
    console.error(`${dep.permissionName} требует ${dep.missingDependencyName}`);
  });
}
```

### React пример с визуализацией ошибок

```tsx
function PermissionsEditor({ allPermissions }) {
  const [selected, setSelected] = useState([]);
  const validation = useMemo(() =>
    validatePermissions(selected),
    [selected]
  );

  const permissionsWithIssues = useMemo(() =>
    getPermissionsWithMissingDeps(selected),
    [selected]
  );

  return (
    <div>
      {/* Статус валидации */}
      {!validation.isValid && (
        <Alert severity="error">
          Отсутствуют зависимости:
          <ul>
            {validation.missingDependencies.map(dep => (
              <li key={dep.permissionId}>
                {dep.permissionName} → требует {dep.missingDependencyName}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Список разрешений */}
      {allPermissions.map(perm => (
        <div
          key={perm.id}
          className={permissionsWithIssues.has(perm.id) ? 'has-error' : ''}
          onClick={() => setSelected(togglePermission(perm, selected))}
        >
          <input
            type="checkbox"
            checked={selected.some(p => p.id === perm.id)}
          />
          {perm.name}
          {permissionsWithIssues.has(perm.id) && <ErrorIcon />}
        </div>
      ))}

      {/* Кнопка сохранения */}
      <button
        disabled={!validation.isValid}
        onClick={() => save(selected)}
      >
        Сохранить
      </button>
    </div>
  );
}
```

## Joi схема

Схема валидации использует custom validator:

```typescript
export const permissionsSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.string().required(),
      code: Joi.string().required(),
      // ... другие поля
      dependencies: Joi.array().items(
        Joi.object({
          id: Joi.string().required(),
          code: Joi.string().required(),
          name: Joi.string().required(),
        })
      ).required(),
    })
  )
  .custom(dependenciesValidator, 'dependencies validation');
```

Custom validator проверяет что все dependency.id присутствуют среди выбранных разрешений.

## Демо

Откройте `demo-simple.html` в браузере:

```bash
# Если запущен http-server на порту 8000
open http://localhost:8000/demo-simple.html
```

### Что попробовать в демо:

1. **Выберите "Запись пользователей"** (зависит от "Чтение пользователей")
   - ❌ Валидация покажет ошибку: отсутствует зависимость
   - Разрешение подсветится оранжевым

2. **Добавьте "Чтение пользователей"**
   - ✅ Валидация пройдена - статус зеленый

3. **Выберите "Удаление пользователей"** (зависит от READ и WRITE)
   - ❌ Ошибка: отсутствует WRITE

4. **Добавьте WRITE**
   - ✅ Все OK

5. **Удалите "Чтение пользователей"**
   - ❌ Сразу 2 ошибки: WRITE и DELETE требуют READ
   - Оба подсвечены оранжевым

## Плюсы и минусы подхода

### ✅ Плюсы

- **Простота**: Toggle логика тривиальная, легко понять
- **Предсказуемость**: Пользователь контролирует что происходит
- **Гибкость**: Можно временно иметь "сломанное" состояние
- **Понятные ошибки**: Валидация четко показывает что не так
- **Легко исправить**: Просто добавь недостающее разрешение
- **Тестируемость**: Простые функции, легко тестировать
- **Разделение concerns**: UI ≠ валидация

### ❌ Минусы

- **Требует валидации**: Нужно показывать ошибки в UI
- **Больше кликов**: Пользователь должен вручную выбрать зависимости
- **Можно ошибиться**: Легко забыть добавить зависимость
- **Нужен хороший UX**: Важно четко показать что требуется

## Рекомендации по использованию

### Используйте этот подход если:

- ✅ Пользователи - опытные администраторы
- ✅ Важна гибкость и контроль
- ✅ Есть возможность показать хорошие ошибки в UI
- ✅ Разрешения могут редактироваться в draft режиме
- ✅ Валидация происходит при сохранении, а не в реальном времени

### НЕ используйте этот подход если:

- ❌ Пользователи неопытные
- ❌ Критично чтобы состояние всегда было валидным
- ❌ Нет возможности показать валидацию в UI
- ❌ Нужна максимальная простота UX

## Тестирование

### Запуск тестов

```bash
npm test
```

### Тесты toggle логики

`src/utils/__tests__/permissionsManager.test.ts` - проверяет:
- ✅ Простое добавление/удаление
- ✅ НЕ добавляет зависимости автоматически
- ✅ НЕ удаляет каскадно
- ✅ Корректный toggle behavior

### Тесты валидации

`src/utils/__tests__/permissionsValidator.test.ts` - проверяет:
- ✅ Находит отсутствующие зависимости
- ✅ Правильно валидирует корректные наборы
- ✅ Хелперы работают корректно
- ✅ Joi схема работает

## Миграция с автоматического подхода

Если переходите с ветки с автоматическим управлением:

1. **Обновите вызовы togglePermission**:
   ```typescript
   // Было (с allPermissions)
   togglePermission(perm, allPermissions, selected);

   // Стало (без allPermissions)
   togglePermission(perm, selected);
   ```

2. **Добавьте валидацию**:
   ```typescript
   import { validatePermissions } from './utils/permissionsValidator';

   const validation = validatePermissions(selected);
   if (!validation.isValid) {
     // Покажите ошибки
   }
   ```

3. **Обновите UI** для отображения ошибок валидации

## FAQ

**Q: Можно ли комбинировать оба подхода?**
A: Технически да, но не рекомендуется. Выберите один подход для консистентности.

**Q: Когда запускать валидацию?**
A: Зависит от UX. Варианты:
- При каждом изменении (real-time feedback)
- При нажатии "Сохранить" (меньше шума)
- Комбинация: показывать предупреждения, блокировать сохранение

**Q: Что если зависимость сама имеет зависимости?**
A: Валидация проверяет только прямые зависимости. Транзитивные зависимости нужно обрабатывать отдельно если требуется.

**Q: Можно ли автоматически добавлять недостающие зависимости?**
A: Да! Можно создать функцию `autoFixDependencies` которая добавит все недостающие. Но это вернет вас к автоматическому подходу.

## Лицензия

MIT
