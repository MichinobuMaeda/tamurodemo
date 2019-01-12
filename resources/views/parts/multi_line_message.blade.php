@inject('vh', 'App\Services\ViewHelperService')
<p>
@foreach (preg_split('/\n/', $vh->message($slot)) as $msg)
  {{ $msg }}<br>
@endforeach
</p>
