# Как добавлять поля ввода в HTML

Поля ввода создаются с помощью тега `<input>` и других элементов форм. Вот полное руководство с примерами.

## 1. Базовый синтаксис

```html
<input type="текст" name="имя_поля" placeholder="Подсказка">
```

## 2. Основные типы полей ввода

```html
<!-- Текстовое поле -->
<input type="text" name="username" placeholder="Введите имя">

<!-- Пароль -->
<input type="password" name="password" placeholder="Введите пароль">

<!-- Email -->
<input type="email" name="email" placeholder="example@mail.com">

<!-- Число -->
<input type="number" name="age" min="1" max="100">

<!-- Дата -->
<input type="date" name="birthdate">

<!-- Телефон -->
<input type="tel" name="phone" placeholder="+7 (999) 000-00-00">

<!-- Чекбокс -->
<input type="checkbox" name="agree" id="agree">
<label for="agree">Я согласен</label>

<!-- Радио-кнопки -->
<input type="radio" name="gender" value="male" id="male">
<label for="male">Мужской</label>
<input type="radio" name="gender" value="female" id="female">
<label for="female">Женский</

<!-- Выпадающий список -->
<select name="country">
  <option value="ru">Россия</option>
  <option value="us">США</option>
  <option value="kz">Казахстан</option>
</select>

<!-- Текстовая область -->
<textarea name="message" rows="4" cols="50"></textarea>
```

## 3. Полный пример формы

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Форма регистрации</title>
  <style>
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #007bff;
    }
    
    button {
      background: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #0056b3;
    }
  </style>
</head>
<body>
  <form id="registrationForm">
    <div class="form-group">
      <label for="name">Имя:</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
      <label for="email">Email:</label>
      <input type="email" id="email" name="email" required>
    </div>
    
    <div class="form-group">
      <label for="password">Пароль:</label>
      <input type="password" id="password" name="password" required minlength="6">
    </div>
    
    <div class="form-group">
      <label for="country">Страна:</label>
      <select id="country" name="country">
        <option value="">Выберите страну</option>
        <option value="ru">Россия</option>
        <option value="kz">Казахстан</option>
      </select>
    </div>
    
    <button type="submit">Зарегистрироваться</button>
  </form>

  <script>
    document.getElementById('registrationForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Получение данных
      const formData = new FormData(this);
      const data = Object.fromEntries(formData);
      
      console.log('Данные формы:', data);
      alert('Форма отправлена!');
    });
  </script>
</body>
</html>
```

## 4. Полезные атрибуты

| Атрибут | Описание |
|---------|----------|
| `required` | Обязательное поле |
| `placeholder` | Подсказка в поле |
| `disabled` | Отключенное поле |
| `readonly` | Только для чтения |
| `minlength` / `maxlength` | Ограничение длины |
| `min` / `max` | Мин/макс значение (для чисел) |
| `pattern` | Регулярное выражение для валидации |
| `autofocus` | Автофокус при загрузке |
| `autocomplete` | Автозаполнение |

## 5. Валидация с JavaScript

```javascript
const input = document.querySelector('#email');

input.addEventListener('input', function() {
  if (this.validity.valid) {
    this.style.borderColor = 'green';
  } else {
    this.style.borderColor = 'red';
  }
});
```

## 6. Современные возможности

```html
<!-- Автозаполнение -->
<input type="text" autocomplete="name">

<!-- Маска ввода (требует JS библиотеки) -->
<input type="tel" id="phone" placeholder="+7 (___) ___-__-__">

<!-- Поиск с очисткой -->
<input type="search" placeholder="Поиск...">

<!-- Цвет -->
<input type="color" name="color">

<!-- Файл -->
<input type="file" name="avatar" accept="image/*">
```

## 💡 Советы

1. **Всегда используйте `<label>`** — это улучшает доступность
2. **Добавляйте `required`** для обязательных полей
3. **Используйте правильные `type`** для мобильной оптимизации
4. **Добавляйте `placeholder`** для подсказок
5. **Валидируйте данные** и на клиенте, и на сервере

Нужен пример конкретного типа поля или помощь с валидацией? 🚀