<?php
// $ git clone https://github.com/languitar/drawio-batch
// $ cd drawio-batch
// $ npm -g install
// 
// Merge / convert multiple PDF files into one PDF
// https://stackoverflow.com/questions/2507766/merge-convert-multiple-pdf-files-into-one-pdf
// 
// How do I remove a directory that is not empty?
// https://stackoverflow.com/questions/1653771/how-do-i-remove-a-directory-that-is-not-empty

$dir_src = dirname(__FILE__).DIRECTORY_SEPARATOR;
$dir_tmp = dirname(__FILE__).DIRECTORY_SEPARATOR.'tmp'.DIRECTORY_SEPARATOR;
$pdf = dirname(__FILE__).DIRECTORY_SEPARATOR.'..'.DIRECTORY_SEPARATOR.'tamuro_design.pdf';

function emptyDir($dir) {
  if (is_dir($dir)) {
      $scn = scandir($dir);
      foreach ($scn as $files) {
          if ($files !== '.') {
              if ($files !== '..') {
                  if (!is_dir($dir.DIRECTORY_SEPARATOR.$files)) {
                      unlink($dir.DIRECTORY_SEPARATOR.$files);
                  } else {
                      emptyDir($dir.DIRECTORY_SEPARATOR.$files);
                      rmdir($dir.DIRECTORY_SEPARATOR.$files);
                  }
              }
          }
      }
  }
}

if (is_dir($dir_tmp)) {
  emptyDir($dir_tmp);
  rmdir($dir_tmp);
}
mkdir($dir_tmp);

$files = [];

foreach (scandir($dir_src) as $file) {
  if (!preg_match('/\.xml$/i', $file)) { continue; }
  echo $file;
  $src = $dir_src.$file;
  $trg = $dir_tmp.preg_replace('/\.xml$/i', '.pdf', $file);
  exec('drawio-batch '.$src.' '.$trg);
  echo "\tdone.\n";
  $files[] = $trg;
}

echo 'concatenate PDF files';
exec('gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/default -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages -dCompressFonts=true -r150 -sOutputFile='.$pdf.' '.join(' ', $files));
echo "\tdone.\n";

emptyDir($dir_tmp);
rmdir($dir_tmp);
