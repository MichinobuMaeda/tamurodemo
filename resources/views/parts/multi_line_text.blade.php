@if($text)
<p>
@foreach (preg_split('/\n/', $text) as $line)
  {{ $line }}<br>
@endforeach
</p>
@endif
