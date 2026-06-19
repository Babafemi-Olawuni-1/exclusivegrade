<?php
function success($data = null, $message = 'Success', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function error($message = 'Error', $code = 400, $errors = []) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'errors' => $errors
    ]);
    exit;
}

function body() {
    $json = file_get_contents('php://input');
    return json_decode($json, true) ?? [];
}

function paginate($items, $total, $page, $perPage) {
    return [
        'items' => $items,
        'total' => (int)$total,
        'page' => (int)$page,
        'per_page' => (int)$perPage,
        'last_page' => ceil($total / $perPage)
    ];
}