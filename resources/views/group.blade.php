@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
      @include('parts.card_group', ['group' => $group])
    </div>
  </div>
</div>
@endsection
