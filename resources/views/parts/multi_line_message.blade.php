@inject('vh', 'App\Services\ViewHelperService')
@foreach (preg_split('/\n/', $vh->message($slot)) as $msg)
  <p>{{ $msg }}</p>
@endforeach
