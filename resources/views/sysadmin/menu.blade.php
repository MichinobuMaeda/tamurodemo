@extends('layouts.app')
@inject('vh', 'App\Services\ViewHelperService')
@section('content')
<div class="container">
  <div class="row justify-content-center">
    <div class="col-md-8">
    <div class="card">
      <div class="card-header">
        {{ __('System administration') }}
      </div>

      <div class="card-body">
        {{ __('Under construction') }}
      </div>
    </div>
  </div>
</div>
@endsection
