# Быстрый старт

## Вариант 1: Просто открыть HTML файл (самый быстрый способ)

Просто откройте файл `demo.html` в браузере:

```bash
# Linux
xdg-open demo.html

# macOS
open demo.html

# Windows
start demo.html

# Или просто перетащите файл в браузер
```

Это standalone демо со всей логикой внутри. Откройте консоль браузера (F12), чтобы видеть выбранные разрешения.

---

## Вариант 2: Запустить с Node.js и Vite (для разработки)

### Шаг 1: Установка зависимостей

```bash
npm install
# или
yarn install
# или
pnpm install
```

### Шаг 2: Настройка Vite (нужно добавить конфиг)

Создайте файл `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Шаг 3: Добавьте в package.json скрипты для разработки

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### Шаг 4: Создайте точку входа

Создайте `index.html` в корне проекта и `src/main.tsx`

### Шаг 5: Запустите dev сервер

```bash
npm run dev
```

---

## Вариант 3: Интеграция в существующий проект

### Установка в существующий React проект

```bash
# Скопируйте файлы в ваш проект
cp -r src/types /path/to/your/project/src/
cp -r src/utils /path/to/your/project/src/
cp -r src/hooks /path/to/your/project/src/
cp -r src/components /path/to/your/project/src/
```

### Использование

```typescript
import { PermissionsList } from './components/PermissionsList';
import { PlatformPermissionInstance } from './types/permissions';

function YourComponent() {
  const permissions: Array<PlatformPermissionInstance> = [
    // ваши данные
  ];

  return <PermissionsList allPermissions={permissions} />;
}
```

---

## Вариант 4: Запуск тестов

```bash
# Установите зависимости для тестирования
npm install --save-dev jest @types/jest ts-jest @testing-library/react

# Запустите тесты
npm test

# Запустите с покрытием
npm run test:coverage
```

---

## Тестирование функциональности

### Что попробовать:

1. **Простой выбор**: Кликните на "Чтение отчетов" - должно выбраться только оно

2. **Выбор с зависимостями**: Кликните на "Запись пользователей"
   - Должны выбраться: "Чтение пользователей" + "Запись пользователей"

3. **Множественные зависимости**: Кликните на "Удаление пользователей"
   - Должны выбраться: "Чтение пользователей" + "Запись пользователей" + "Удаление пользователей"

4. **Проверка дубликатов**: После шага 3, кликните на "Запись пользователей" (для отмены)
   - Должно остаться: "Чтение пользователей" + "Удаление пользователей"
   - "Чтение пользователей" НЕ должно удалиться, т.к. используется в "Удаление пользователей"

5. **Полная очистка**: Кликните "Очистить выбор"
   - Все должно сброситься

6. **Неактивное разрешение**: Кликните на "Доступ к админ-панели" (серый)
   - Оно тоже должно выбраться вместе со всеми зависимостями

### Проверка в консоли

Откройте консоль браузера (F12) и после каждого клика увидите:
```
Выбранные разрешения: Array(...)
Коды: Array(...)
```

---

## Быстрая проверка работы логики (Node REPL)

```bash
node
```

```javascript
// Скопируйте код из src/utils/permissionsManager.ts и протестируйте
const permissions = [
  { id: '1', code: 'READ', dependencies: [] },
  { id: '2', code: 'WRITE', dependencies: [{ id: '1' }] }
];

let selected = togglePermission(permissions[1], permissions, []);
console.log(selected); // Должно быть 2 элемента
```

---

## Структура проекта для понимания

```
dws4/
├── demo.html              ← НАЧНИТЕ ОТСЮДА! Просто откройте в браузере
├── README.md              ← Полная документация
├── EXAMPLES.md            ← Примеры использования
├── QUICKSTART.md          ← Этот файл
├── package.json
├── tsconfig.json
└── src/
    ├── types/
    │   └── permissions.ts          ← Типы данных
    ├── utils/
    │   ├── permissionsManager.ts   ← Основная логика
    │   └── __tests__/
    │       └── permissionsManager.test.ts
    ├── hooks/
    │   └── usePermissions.ts       ← React хук
    ├── components/
    │   ├── PermissionsList.tsx     ← UI компонент
    │   └── PermissionsList.css
    └── examples/
        └── usage-example.tsx
```

---

## Возможные проблемы и решения

### Проблема: "Cannot find module 'react'"

**Решение**: Установите зависимости:
```bash
npm install react react-dom
npm install --save-dev @types/react @types/react-dom
```

### Проблема: TypeScript ошибки

**Решение**: Убедитесь что у вас установлен TypeScript:
```bash
npm install --save-dev typescript
```

### Проблема: Тесты не запускаются

**Решение**: Установите тестовые зависимости:
```bash
npm install --save-dev jest @types/jest ts-jest @testing-library/react @testing-library/react-hooks
```

---

## Следующие шаги

1. ✅ Откройте `demo.html` и поиграйтесь с интерфейсом
2. ✅ Посмотрите код в `src/utils/permissionsManager.ts` чтобы понять логику
3. ✅ Прочитайте `EXAMPLES.md` для понимания различных сценариев
4. ✅ Запустите тесты `npm test`
5. ✅ Интегрируйте в свой проект

Удачи! 🚀
