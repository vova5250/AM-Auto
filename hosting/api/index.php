<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

final class ApiError extends RuntimeException
{
    public int $status;

    public function __construct(int $status, string $message)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

function respond($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function fail(int $status, string $message): void
{
    throw new ApiError($status, $message);
}

function body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        fail(400, 'Некорректный JSON');
    }
    return $decoded;
}

function required_text(array $input, string $key, int $maxLength): string
{
    $raw = $input[$key] ?? '';
    if (!is_scalar($raw)) {
        fail(422, 'Проверьте обязательные поля формы');
    }
    $value = trim((string)$raw);
    if ($value === '' || strlen($value) > $maxLength) {
        fail(422, 'Проверьте обязательные поля формы');
    }
    return $value;
}

function optional_text(array $input, string $key, int $maxLength = 5000): string
{
    $raw = $input[$key] ?? '';
    if (!is_scalar($raw)) {
        fail(422, 'Некорректное значение поля');
    }
    $value = trim((string)$raw);
    if (strlen($value) > $maxLength) {
        fail(422, 'Слишком длинное значение поля');
    }
    return $value;
}

function integer_value(array $input, string $key, int $default, int $minimum, int $maximum): int
{
    if (!array_key_exists($key, $input)) {
        return $default;
    }
    $value = filter_var($input[$key], FILTER_VALIDATE_INT);
    if ($value === false || $value < $minimum || $value > $maximum) {
        fail(422, 'Некорректное числовое значение');
    }
    return $value;
}

function database(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    global $config;
    $db = $config['database'] ?? [];
    foreach (['host', 'name', 'user', 'password'] as $key) {
        if (!isset($db[$key]) || $db[$key] === '' || str_starts_with((string)$db[$key], 'YOUR_')) {
            fail(503, 'Настройте подключение к базе данных в api/config.php');
        }
    }
    if (empty($config['jwt_secret']) || strlen((string)$config['jwt_secret']) < 32 || str_starts_with((string)$config['jwt_secret'], 'REPLACE_')) {
        fail(503, 'Настройте секрет авторизации в api/config.php');
    }
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $db['host'], $db['name']);
    try {
        $pdo = new PDO($dsn, $db['user'], $db['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $error) {
        error_log('AM Auto database connection failed: ' . $error->getMessage());
        fail(503, 'Не удалось подключиться к базе данных');
    }
    return $pdo;
}

function token_part(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function create_token(array $user): string
{
    global $config;
    $header = token_part(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = token_part(json_encode([
        'sub' => (string)$user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + 604800,
    ]));
    $signature = token_part(hash_hmac('sha256', $header . '.' . $payload, $config['jwt_secret'], true));
    return $header . '.' . $payload . '.' . $signature;
}

function authenticated_user(): array
{
    global $config;
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $authorization = (string)($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    foreach ($headers as $name => $value) {
        if (strtolower((string)$name) === 'authorization') {
            $authorization = (string)$value;
            break;
        }
    }
    if (!preg_match('/^Bearer\s+(\S+)$/i', $authorization, $matches)) {
        fail(401, 'Требуется авторизация');
    }
    $parts = explode('.', $matches[1]);
    if (count($parts) !== 3) {
        fail(401, 'Недействительный токен');
    }
    [$header, $payload, $signature] = $parts;
    $expected = token_part(hash_hmac('sha256', $header . '.' . $payload, $config['jwt_secret'], true));
    $decoded = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
    if (!hash_equals($expected, $signature) || !is_array($decoded) || ($decoded['exp'] ?? 0) < time() || ($decoded['role'] ?? '') !== 'admin') {
        fail(401, 'Недействительный или просроченный токен');
    }
    return $decoded;
}

function admin_user(): array
{
    $token = authenticated_user();
    $query = database()->prepare('SELECT id, email, name, role, created_at FROM users WHERE id = ?');
    $query->execute([(int)$token['sub']]);
    $user = $query->fetch();
    if (!$user) {
        fail(401, 'Учётная запись не найдена');
    }
    $user['_id'] = (string)$user['id'];
    $user['id'] = (string)$user['id'];
    $user['createdAt'] = $user['created_at'];
    unset($user['created_at']);
    return $user;
}

function protect_admin(): void
{
    authenticated_user();
}

function find_by_id(string $table, int $id): ?array
{
    $allowed = ['services', 'reviews', 'gallery', 'requests'];
    if (!in_array($table, $allowed, true)) {
        fail(404, 'Не найдено');
    }
    $query = database()->prepare("SELECT * FROM `$table` WHERE id = ?");
    $query->execute([$id]);
    $row = $query->fetch();
    return $row ?: null;
}

function to_api_row(?array $row): ?array
{
    if (!$row) {
        return null;
    }
    $row['_id'] = (string)$row['id'];
    if (array_key_exists('sort_order', $row)) {
        $row['order'] = (int)$row['sort_order'];
        unset($row['sort_order']);
    }
    foreach (['car_model' => 'carModel', 'image_url' => 'imageUrl'] as $source => $target) {
        if (array_key_exists($source, $row)) {
            $row[$target] = $row[$source];
            unset($row[$source]);
        }
    }
    foreach (['rating', 'approved'] as $field) {
        if (array_key_exists($field, $row)) {
            $row[$field] = $field === 'approved' ? (bool)$row[$field] : (int)$row[$field];
        }
    }
    foreach (['id'] as $field) {
        if (array_key_exists($field, $row)) {
            $row[$field] = (string)$row[$field];
        }
    }
    foreach (['created_at' => 'createdAt', 'updated_at' => 'updatedAt'] as $source => $target) {
        if (array_key_exists($source, $row)) {
            $row[$target] = $row[$source];
            unset($row[$source]);
        }
    }
    return $row;
}

function current_method(): string
{
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function current_path(): string
{
    $path = trim((string)($_GET['path'] ?? ''), '/');
    return $path;
}

try {
    $configPath = __DIR__ . '/config.php';
    if (!is_file($configPath)) {
        fail(503, 'Не найдена конфигурация api/config.php');
    }
    $config = require $configPath;
    $path = current_path();
    $method = current_method();
    $parts = $path === '' ? [] : explode('/', $path);
    $input = in_array($method, ['POST', 'PUT', 'PATCH'], true) ? body() : [];

    if (($parts[0] ?? '') === 'auth') {
        if (($parts[1] ?? '') === 'register' && $method === 'POST') {
            fail(403, 'Создавайте первого администратора через install.php');
        }
        if (($parts[1] ?? '') === 'login' && $method === 'POST') {
            $email = strtolower(required_text($input, 'email', 255));
            $password = (string)($input['password'] ?? '');
            $query = database()->prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ? LIMIT 1');
            $query->execute([$email]);
            $user = $query->fetch();
            if (!$user || !password_verify($password, $user['password_hash'])) {
                fail(401, 'Неверные учетные данные');
            }
            respond([
                'token' => create_token($user),
                'user' => ['id' => (string)$user['id'], 'email' => $user['email'], 'name' => $user['name'], 'role' => $user['role']],
            ]);
        }
        if (($parts[1] ?? '') === 'me' && $method === 'GET') {
            respond(admin_user());
        }
    }

    if ($parts === ['admin', 'dashboard'] && $method === 'GET') {
        protect_admin();
        $pdo = database();
        respond([
            'services' => (int)$pdo->query('SELECT COUNT(*) FROM services')->fetchColumn(),
            'reviews' => (int)$pdo->query('SELECT COUNT(*) FROM reviews WHERE approved = 1')->fetchColumn(),
            'newRequests' => (int)$pdo->query("SELECT COUNT(*) FROM requests WHERE status = 'new'")->fetchColumn(),
            'galleryItems' => (int)$pdo->query('SELECT COUNT(*) FROM gallery')->fetchColumn(),
        ]);
    }

    if (($parts[0] ?? '') === 'services') {
        $pdo = database();
        if (count($parts) === 1 && $method === 'GET') {
            $rows = $pdo->query('SELECT * FROM services ORDER BY sort_order, id')->fetchAll();
            respond(array_map('to_api_row', $rows));
        }
        if (count($parts) === 1 && $method === 'POST') {
            protect_admin();
            $title = required_text($input, 'title', 255);
            $query = $pdo->prepare('INSERT INTO services (title, description, icon, sort_order) VALUES (?, ?, ?, ?)');
            $query->execute([$title, optional_text($input, 'description'), optional_text($input, 'icon', 500), integer_value($input, 'order', 0, 0, 2147483647)]);
            respond(to_api_row(find_by_id('services', (int)$pdo->lastInsertId())), 201);
        }
        if (count($parts) === 2 && ctype_digit($parts[1])) {
            $id = (int)$parts[1];
            if ($method === 'PUT') {
                protect_admin();
                $existing = find_by_id('services', $id);
                if (!$existing) {
                    fail(404, 'Услуга не найдена');
                }
                $query = $pdo->prepare('UPDATE services SET title = ?, description = ?, icon = ?, sort_order = ? WHERE id = ?');
                $query->execute([
                    array_key_exists('title', $input) ? required_text($input, 'title', 255) : $existing['title'],
                    array_key_exists('description', $input) ? optional_text($input, 'description') : $existing['description'],
                    array_key_exists('icon', $input) ? optional_text($input, 'icon', 500) : $existing['icon'],
                    integer_value($input, 'order', (int)$existing['sort_order'], 0, 2147483647),
                    $id,
                ]);
                respond(to_api_row(find_by_id('services', $id)));
            }
            if ($method === 'DELETE') {
                protect_admin();
                $query = $pdo->prepare('DELETE FROM services WHERE id = ?');
                $query->execute([$id]);
                respond(['message' => 'Услуга удалена']);
            }
        }
    }

    if (($parts[0] ?? '') === 'reviews') {
        $pdo = database();
        if (count($parts) === 1 && $method === 'GET') {
            $rows = $pdo->query('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC')->fetchAll();
            respond(array_map('to_api_row', $rows));
        }
        if ($parts === ['reviews', 'admin', 'all'] && $method === 'GET') {
            protect_admin();
            $rows = $pdo->query('SELECT * FROM reviews ORDER BY created_at DESC')->fetchAll();
            respond(array_map('to_api_row', $rows));
        }
        if (count($parts) === 1 && $method === 'POST') {
            $name = required_text($input, 'name', 255);
            $text = required_text($input, 'text', 5000);
            $rating = integer_value($input, 'rating', 5, 1, 5);
            $query = $pdo->prepare('INSERT INTO reviews (name, text, rating, approved) VALUES (?, ?, ?, 0)');
            $query->execute([$name, $text, $rating]);
            respond(to_api_row(find_by_id('reviews', (int)$pdo->lastInsertId())), 201);
        }
        if (count($parts) === 3 && ctype_digit($parts[1]) && $parts[2] === 'approve' && $method === 'PUT') {
            protect_admin();
            $query = $pdo->prepare('UPDATE reviews SET approved = 1 WHERE id = ?');
            $query->execute([(int)$parts[1]]);
            if (!$query->rowCount() && !find_by_id('reviews', (int)$parts[1])) {
                fail(404, 'Отзыв не найден');
            }
            respond(to_api_row(find_by_id('reviews', (int)$parts[1])));
        }
        if (count($parts) === 2 && ctype_digit($parts[1]) && $method === 'DELETE') {
            protect_admin();
            $query = $pdo->prepare('DELETE FROM reviews WHERE id = ?');
            $query->execute([(int)$parts[1]]);
            respond(['message' => 'Отзыв удален']);
        }
    }

    if (($parts[0] ?? '') === 'requests') {
        $pdo = database();
        if (count($parts) === 1 && $method === 'GET') {
            protect_admin();
            $rows = $pdo->query('SELECT * FROM requests ORDER BY created_at DESC')->fetchAll();
            respond(array_map('to_api_row', $rows));
        }
        if (count($parts) === 1 && $method === 'POST') {
            $name = required_text($input, 'name', 255);
            $phone = required_text($input, 'phone', 64);
            $query = $pdo->prepare('INSERT INTO requests (name, phone, car_model, problem, status) VALUES (?, ?, ?, ?, ?)');
            $query->execute([$name, $phone, optional_text($input, 'carModel', 255), optional_text($input, 'problem'), 'new']);
            respond(to_api_row(find_by_id('requests', (int)$pdo->lastInsertId())), 201);
        }
        if (count($parts) === 2 && ctype_digit($parts[1])) {
            $id = (int)$parts[1];
            if ($method === 'PUT') {
                protect_admin();
                $existing = find_by_id('requests', $id);
                if (!$existing) {
                    fail(404, 'Заявка не найдена');
                }
                $status = $input['status'] ?? $existing['status'];
                if (!is_string($status)) {
                    fail(422, 'Неизвестный статус заявки');
                }
                if (!in_array($status, ['new', 'in_progress', 'completed', 'rejected'], true)) {
                    fail(422, 'Неизвестный статус заявки');
                }
                $query = $pdo->prepare('UPDATE requests SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
                $query->execute([$status, array_key_exists('notes', $input) ? optional_text($input, 'notes') : $existing['notes'], $id]);
                respond(to_api_row(find_by_id('requests', $id)));
            }
            if ($method === 'DELETE') {
                protect_admin();
                $query = $pdo->prepare('DELETE FROM requests WHERE id = ?');
                $query->execute([$id]);
                respond(['message' => 'Заявка удалена']);
            }
        }
    }

    if (($parts[0] ?? '') === 'gallery') {
        $pdo = database();
        if (count($parts) === 1 && $method === 'GET') {
            $rows = $pdo->query('SELECT * FROM gallery ORDER BY sort_order, id')->fetchAll();
            respond(array_map('to_api_row', $rows));
        }
        if (count($parts) === 1 && $method === 'POST') {
            protect_admin();
            $imageUrl = required_text($input, 'imageUrl', 2048);
            $query = $pdo->prepare('INSERT INTO gallery (title, description, image_url, category, sort_order) VALUES (?, ?, ?, ?, ?)');
            $query->execute([optional_text($input, 'title', 255), optional_text($input, 'description'), $imageUrl, optional_text($input, 'category', 255), integer_value($input, 'order', 0, 0, 2147483647)]);
            respond(to_api_row(find_by_id('gallery', (int)$pdo->lastInsertId())), 201);
        }
        if (count($parts) === 2 && ctype_digit($parts[1])) {
            $id = (int)$parts[1];
            if ($method === 'PUT') {
                protect_admin();
                $existing = find_by_id('gallery', $id);
                if (!$existing) {
                    fail(404, 'Фото не найдено');
                }
                $query = $pdo->prepare('UPDATE gallery SET title = ?, description = ?, image_url = ?, category = ?, sort_order = ? WHERE id = ?');
                $query->execute([
                    array_key_exists('title', $input) ? optional_text($input, 'title', 255) : $existing['title'],
                    array_key_exists('description', $input) ? optional_text($input, 'description') : $existing['description'],
                    array_key_exists('imageUrl', $input) ? required_text($input, 'imageUrl', 2048) : $existing['image_url'],
                    array_key_exists('category', $input) ? optional_text($input, 'category', 255) : $existing['category'],
                    integer_value($input, 'order', (int)$existing['sort_order'], 0, 2147483647),
                    $id,
                ]);
                respond(to_api_row(find_by_id('gallery', $id)));
            }
            if ($method === 'DELETE') {
                protect_admin();
                $query = $pdo->prepare('DELETE FROM gallery WHERE id = ?');
                $query->execute([$id]);
                respond(['message' => 'Фото удалено']);
            }
        }
    }

    if ($parts === ['contacts']) {
        $pdo = database();
        if ($method === 'GET') {
            $contact = $pdo->query('SELECT * FROM contacts WHERE id = 1')->fetch();
            if (!$contact) {
                respond([
                    'phone' => '+7 (999) 999-99-99',
                    'email' => 'info@amauto.ru',
                    'address' => 'Краснодар',
                    'workingHours' => 'Пн-Сб: 9:00-18:00, Вс: выходной',
                    'description' => 'Профессиональная автоэлектрика в Краснодаре',
                ]);
            }
            $contact['workingHours'] = $contact['working_hours'];
            unset($contact['working_hours'], $contact['updated_at']);
            respond($contact);
        }
        if ($method === 'PUT') {
            protect_admin();
            $query = $pdo->prepare(
                'INSERT INTO contacts (id, phone, email, address, working_hours, description) VALUES (1, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE phone = VALUES(phone), email = VALUES(email), address = VALUES(address), working_hours = VALUES(working_hours), description = VALUES(description), updated_at = CURRENT_TIMESTAMP'
            );
            $query->execute([
                optional_text($input, 'phone', 100),
                optional_text($input, 'email', 255),
                optional_text($input, 'address', 500),
                optional_text($input, 'workingHours', 255),
                optional_text($input, 'description'),
            ]);
            $contact = $pdo->query('SELECT * FROM contacts WHERE id = 1')->fetch();
            $contact['workingHours'] = $contact['working_hours'];
            unset($contact['working_hours'], $contact['updated_at']);
            respond($contact);
        }
    }

    fail(404, 'Маршрут API не найден');
} catch (ApiError $error) {
    respond(['message' => $error->getMessage()], $error->status);
} catch (Throwable $error) {
    error_log('AM Auto API error: ' . $error->getMessage());
    respond(['message' => 'Внутренняя ошибка сервера'], 500);
}
