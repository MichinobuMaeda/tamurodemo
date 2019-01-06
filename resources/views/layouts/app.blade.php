<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <!-- CSRF Token -->
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <!-- icons -->
  <link rel="apple-touch-icon" sizes="57x57" href="{{ asset('imgs/touch-icon-57x57.png') }}">
  <link rel="apple-touch-icon" sizes="60x60" href="{{ asset('imgs/touch-icon-60x60.png') }}">
  <link rel="apple-touch-icon" sizes="72x72" href="{{ asset('imgs/touch-icon-72x72.png') }}"> 
  <link rel="apple-touch-icon" sizes="76x76" href="{{ asset('imgs/touch-icon-76x76.png') }}"> 
  <link rel="apple-touch-icon" sizes="114x114" href="{{ asset('imgs/touch-icon-114x114.png') }}">
  <link rel="apple-touch-icon" sizes="120x120" href="{{ asset('imgs/touch-icon-120x120.png') }}">
  <link rel="apple-touch-icon" sizes="144x144" href="{{ asset('imgs/touch-icon-144x144.png') }}"> 
  <link rel="apple-touch-icon" sizes="152x152" href="{{ asset('imgs/touch-icon-152x152.png') }}"> 
  <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('imgs/touch-icon-180x180.png') }}"> 
  <link rel="icon" sizes="192x192" href="{{ asset('imgs/touch-icon-192x192.png') }}">
  <link rel="icon" sizes="128x128" href="{{ asset('imgs/touch-icon-128x128.png') }}"> 
  <link rel="icon" type="image/png" href="{{ asset('imgs/favicon.png') }}">

  <title>{{ config('app.name', 'Tamuro') }}</title>

  <!-- Scripts -->
  <script src="{{ asset('js/app.js') }}" defer></script>

  <!-- Fonts -->
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css?family=Nunito" rel="stylesheet" type="text/css">
  <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">

  <!-- Styles -->
  <link href="{{ asset('css/app.css') }}" rel="stylesheet">
  <style>
  div, p, li, td, th, dt, dd, input, text, button, a {
    font-family: "游ゴシック Medium","Yu Gothic Medium","游ゴシック体",YuGothic,"ヒラギノ角ゴ Pro W3","Hiragino Kaku Gothic Pro","メイリオ",Meiryo,"ＭＳ Ｐゴシック","MS PGothic",sans-serif;
  }
  th, h1, h2, h3, h4, h5, h6 {
    font-weight: normal;
  }
  </style>
</head>
<body>
  <div id="app" style="padding-bottom: 32px;">
    <main class="py-4">
      @yield('content')
    </main>
    <div class="fixed-top d-none d-md-block" style="padding: 4px 8px; text-align: right;">
    @include('layouts.menu',['dir' => 'down'])
    </div>
    <div class="fixed-bottom d-md-none" style="padding: 4px 8px; text-align: right;">
    @include('layouts.menu',['dir' => 'up'])
    </div>
  </div>
</body>
</html>
