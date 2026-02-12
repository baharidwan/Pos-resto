
<?php
/**
 * Nara API Engine - Full Management Version
 */
error_reporting(0);
ini_set('display_errors', 0);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// CONFIG: Sesuaikan dengan kredensial XAMPP Anda
$host = "localhost";
$db_user = "sql_nara";
$db_pass = "i8rK3TM6efXTL8Da";
$db_name = "sql_nara";

$conn = new mysqli($host, $db_user, $db_pass);

if ($conn->connect_error) {
    echo json_encode(["error" => "MySQL tidak terhubung", "message" => $conn->connect_error]);
    exit;
}

$conn->query("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4");
$conn->select_db($db_name);

// Inisialisasi Tabel Jika Belum Ada
function initialize($conn) {
    $conn->query("CREATE TABLE IF NOT EXISTS `products` (id VARCHAR(50) PRIMARY KEY, name VARCHAR(255), price DECIMAL(15,2), costPrice DECIMAL(15,2), category VARCHAR(100), image LONGTEXT, description TEXT, stock INT)");
    $conn->query("CREATE TABLE IF NOT EXISTS `categories` (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE)");
    $conn->query("CREATE TABLE IF NOT EXISTS `tables` (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), status VARCHAR(20))");
    $conn->query("CREATE TABLE IF NOT EXISTS `users` (id VARCHAR(50) PRIMARY KEY, username VARCHAR(100) UNIQUE, password VARCHAR(255), role VARCHAR(20))");
    $conn->query("CREATE TABLE IF NOT EXISTS `orders` (id VARCHAR(50) PRIMARY KEY, customerName VARCHAR(255), total DECIMAL(15,2), timestamp BIGINT, tableNumber VARCHAR(50), status VARCHAR(20), cashReceived DECIMAL(15,2), changeDue DECIMAL(15,2), isPrinted TINYINT(1) DEFAULT 0)");
    $conn->query("CREATE TABLE IF NOT EXISTS `order_items` (id INT AUTO_INCREMENT PRIMARY KEY, order_id VARCHAR(50), product_id VARCHAR(50), name VARCHAR(255), quantity INT, price DECIMAL(15,2))");

    // Add isPrinted column if it doesn't exist (Migration)
    $conn->query("ALTER TABLE `orders` ADD COLUMN IF NOT EXISTS `isPrinted` TINYINT(1) DEFAULT 0");

    // Default Admin
    $res = $conn->query("SELECT COUNT(*) as total FROM users");
    if ($res && $res->fetch_assoc()['total'] == 0) {
        $conn->query("INSERT INTO users (id, username, password, role) VALUES ('u1', 'admin', '123', 'Admin')");
    }
}
initialize($conn);

$action = $_GET['action'] ?? '';

// 1. GET INITIAL DATA
if ($action == 'get_initial_data') {
    $products = $conn->query("SELECT * FROM products")->fetch_all(MYSQLI_ASSOC);
    $categories = $conn->query("SELECT name FROM categories")->fetch_all(MYSQLI_ASSOC);
    $tables = $conn->query("SELECT * FROM tables")->fetch_all(MYSQLI_ASSOC);
    $users = $conn->query("SELECT id, username, password, role FROM users")->fetch_all(MYSQLI_ASSOC);
    $orders = $conn->query("SELECT * FROM orders ORDER BY timestamp DESC LIMIT 100")->fetch_all(MYSQLI_ASSOC);
    
    foreach($orders as &$o) {
        $oid = $o['id'];
        $o['items'] = $conn->query("SELECT * FROM order_items WHERE order_id = '$oid'")->fetch_all(MYSQLI_ASSOC);
        $o['isPrinted'] = (bool)$o['isPrinted'];
    }

    echo json_encode([
        "status" => "online",
        "products" => $products,
        "categories" => array_column($categories, 'name'),
        "tables" => $tables,
        "users" => $users,
        "orders" => $orders
    ]);
    exit;
}

// 2. SAVE PRODUCT
if ($action == 'save_product') {
    $data = json_decode(file_get_contents("php://input"), true);
    if ($data) {
        $id = $data['id']; $n = $data['name']; $p = $data['price']; $cp = $data['costPrice'];
        $cat = $data['category']; $img = $data['image']; $desc = $data['description']; $stk = $data['stock'];
        $stmt = $conn->prepare("REPLACE INTO products (id, name, price, costPrice, category, image, description, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssddsssi", $id, $n, $p, $cp, $cat, $img, $desc, $stk);
        $stmt->execute();
        echo json_encode(["success" => true]);
    }
    exit;
}

// 3. SAVE USER
if ($action == 'save_user') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $conn->query("DELETE FROM users WHERE id = '$id'");
        echo json_encode(["success" => true]);
    } else {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $uid = $data['id']; $user = $data['username']; $pass = $data['password']; $role = $data['role'];
            $stmt = $conn->prepare("REPLACE INTO users (id, username, password, role) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $uid, $user, $pass, $role);
            $stmt->execute();
            echo json_encode(["success" => true]);
        }
    }
    exit;
}

// 4. SAVE TABLE
if ($action == 'save_table') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $conn->query("DELETE FROM tables WHERE id = '$id'");
        echo json_encode(["success" => true]);
    } else {
        $data = json_decode(file_get_contents("php://input"), true);
        if ($data) {
            $tid = $data['id']; $name = $data['name']; $status = $data['status'];
            $stmt = $conn->prepare("REPLACE INTO tables (id, name, status) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $tid, $name, $status);
            $stmt->execute();
            echo json_encode(["success" => true]);
        }
    }
    exit;
}

// 5. SAVE CATEGORY
if ($action == 'save_category') {
    $data = json_decode(file_get_contents("php://input"), true);
    $delName = $_GET['id'] ?? null;

    if ($delName) {
        $conn->query("DELETE FROM categories WHERE name = '$delName'");
        echo json_encode(["success" => true]);
    } else if ($data) {
        $name = $data['name'];
        $oldName = $data['oldName'] ?? null;
        if ($oldName) {
            $conn->query("UPDATE categories SET name = '$name' WHERE name = '$oldName'");
            $conn->query("UPDATE products SET category = '$name' WHERE category = '$oldName'");
        } else {
            $conn->query("INSERT IGNORE INTO categories (name) VALUES ('$name')");
        }
        echo json_encode(["success" => true]);
    }
    exit;
}

// 6. SAVE ORDER
if ($action == 'save_order') {
    $data = json_decode(file_get_contents("php://input"), true);
    if ($data) {
        $id = $data['id']; $cust = $data['customerName']; $tot = $data['total']; 
        $ts = $data['timestamp']; $tbl = $data['tableNumber']; $st = $data['status'];
        $cash = $data['cashReceived'] ?? 0; $chg = $data['change'] ?? 0;
        $isPrnt = isset($data['isPrinted']) ? ($data['isPrinted'] ? 1 : 0) : 0;

        $stmt = $conn->prepare("REPLACE INTO orders (id, customerName, total, timestamp, tableNumber, status, cashReceived, changeDue, isPrinted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssdissddi", $id, $cust, $tot, $ts, $tbl, $st, $cash, $chg, $isPrnt);
        
        if ($stmt->execute()) {
            $conn->query("DELETE FROM order_items WHERE order_id = '$id'");
            foreach($data['items'] as $item) {
                $pid = $item['id']; $in = $item['name']; $iq = $item['quantity']; $ip = $item['price'];
                $conn->query("INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES ('$id', '$pid', '$in', $iq, $ip)");
            }
            echo json_encode(["success" => true]);
        }
    }
    exit;
}

// 7. MARK AS PRINTED
if ($action == 'mark_as_printed') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        $conn->query("UPDATE orders SET isPrinted = 1 WHERE id = '$id'");
        echo json_encode(["success" => true]);
    }
    exit;
}

// 8. DELETE ORDER
if ($action == 'delete_order') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        $conn->query("DELETE FROM orders WHERE id = '$id'");
        $conn->query("DELETE FROM order_items WHERE order_id = '$id'");
        echo json_encode(["success" => true]);
    }
    exit;
}
?>
