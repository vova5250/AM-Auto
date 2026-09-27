<?php
declare(strict_types=1);

$configPath = __DIR__ . '/api/config.php';
$message = '';
$created = false;

function h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

if (!is_file($configPath)) {
    http_response_code(503);
    $message = 'Не найдена api/config.php. Создайте его из config.example.php и укажите данные базы.';
} else {
    $config = require $configPath;
    try {
        $db = $config['database'];
        $pdo = new PDO(
            sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $db['host'], $db['name']),
            $db['user'],
            $db['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        $count = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        if ($count > 0) {
            http_response_code(410);
            $message = 'Администратор уже создан. Удалите install.php с хостинга.';
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $setupKey = is_string($_POST['setup_key'] ?? null) ? $_POST['setup_key'] : '';
            $email = is_string($_POST['email'] ?? null) ? strtolower(trim($_POST['email'])) : '';
            $name = is_string($_POST['name'] ?? null) ? trim($_POST['name']) : '';
            $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
            if (empty($config['setup_key']) || str_starts_with((string)$config['setup_key'], 'REPLACE_') || !hash_equals((string)$config['setup_key'], $setupKey)) {
                $message = 'Неверный ключ установки.';
            } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL) || $name === '' || strlen($name) > 255 || strlen($password) < 12) {
                $message = 'Укажите корректный email, имя и пароль длиной не менее 12 символов.';
            } else {
                $query = $pdo->prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
                $query->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name]);
                $created = true;
            }
        }
    } catch (Throwable $error) {
        error_log('AM Auto installer error: ' . $error->getMessage());
        http_response_code(503);
        $message = 'Не удалось подключиться к базе. Проверьте api/config.php и импорт database.sql.';
    }
}
?>
<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Настройка АМ Авто</title>
  <style>
    body{font:16px/1.5 system-ui,sans-serif;max-width:520px;margin:8vh auto;padding:24px;color:#202124}
    label{display:block;margin:16px 0 6px}input{box-sizing:border-box;width:100%;padding:10px}
    button{margin-top:20px;padding:12px 18px} .message{padding:12px;background:#f1f3f4}
  </style>
</head>
<body>
  <h1>Первый администратор</h1>
  <?php if ($created): ?>
    <p class="message">Готово. Войдите в <a href="/admin/">админ-панель</a> и удалите файл install.php с хостинга.</p>
  <?php elseif ($message !== ''): ?>
    <p class="message"><?= h($message) ?></p>
  <?php endif; ?>
  <?php if (http_response_code() !== 410 && !$created && is_file($configPath)): ?>
    <form method="post">
      <label for="setup_key">Ключ установки из вывода build:hosting</label>
      <input id="setup_key" name="setup_key" required autocomplete="off">
      <label for="name">Имя администратора</label>
      <input id="name" name="name" required maxlength="255">
      <label for="email">Email</label>
      <input id="email" name="email" type="email" required maxlength="255">
      <label for="password">Пароль (минимум 12 символов)</label>
      <input id="password" name="password" type="password" minlength="12" required autocomplete="new-password">
      <button type="submit">Создать администратора</button>
    </form>
  <?php endif; ?>
</body>
</html>
