<?php
$dir = __DIR__ . '/';
$episodes = array_diff(scandir($dir), array('..', '.'));

$episodeData = [];

foreach($episodes as $episode) {
    if(is_dir($dir . $episode)) {
        $frames = array_diff(scandir($dir . $episode), array('..', '.'));
        $frames = array_filter($frames, function($frame) {
            return strpos($frame, 'before') !== false || strpos($frame, 'after') !== false;
        });
        $episodeData[$episode] = array_values($frames);
    }
}

header('Content-Type: application/json');
echo json_encode($episodeData);
?>

