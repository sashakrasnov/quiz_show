<?php

/*
 * Feedback information recording script
 *
 * Input:
 *    @q   -> str: question id code
 *    @s   -> int: optional slide id
 *    @yes -> bool: 1 for like or 0 for dislike
 *
 * Returns:
 *    str  -> encoded JSON respinse
 */


error_reporting(~E_ALL);
session_start();


// Response function in JSON format

function e_response($text, $code) {
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'result'  => $code,
        'message' => $text . (
            $code !== 0 ? ' See error log for detailed information.' : ''
        )
    ]);
}


// Checking input parameters

if( !isset($_GET['q']) || !isset($_GET['yes']) ) {
    e_response('Required parameters are missing.', 1);

    error_log("Required parameters are missing: q={$_GET['q']}, yes={$_GET['yes']}");
    die;
}


// Connecting to MySQL server

$DB = new mysqli('localhost', 'root', '', 'quiz');

if($DB->connect_errno) {
    e_response('Failed to connect to MySQL server.', 2);

    error_log('Failed to connect to MySQL: ' . $DB->connect_error);
    die;
}

$DB->set_charset('utf8');


// Inserting vote into the database table

$DB->query(sprintf("INSERT INTO feedback (`session`, `q`, `s`, `yes`, `addr`, `agent`)
            VALUES ('%s', '%s', %s, %d, '%s', '%s')",
                session_id(),
                $DB->real_escape_string($_GET['q']),
                isset($_GET['s']) && is_numeric($_GET['s']) ? intval($_GET['s']) : 'NULL',
                intval($_GET['yes']),
                $DB->real_escape_string($_SERVER['REMOTE_ADDR']),
                $DB->real_escape_string($_SERVER['HTTP_USER_AGENT']))
);

// Raising an error if insert operation was not completed successfully

if(!$DB->insert_id) {
    e_response('Query execution error.', 3);

    error_log('Error description: ' . $DB->error);
    die;
}

// Uncomment the line below to enable the purging of duplicate votes from the same person
//$DB->query('DELETE t1 FROM feedback AS t1 INNER JOIN feedback AS t2 ON t1.session = t2.session AND t1.q = t2.q AND t1.yes = t2.yes WHERE t1.id < t2.id');

$DB->close();


// Successful response

e_response('Thank you!', 0);

?>