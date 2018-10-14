<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Auth::routes();

Route::get('/', 'HomeController@index')->name('home');

Route::get(
  '/users',
  'UsersController@list'
)->name('users.list')->middleware('can:users.list');
Route::get(
  '/users/orderBy/{orderBy}/orderDir/{orderDir}',
  'UsersController@list'
)->name('users.list.orderBy')->middleware('can:users.list');
Route::post(
  '/users/{user}/invite',
  'UsersController@invite'
)->name('users.invite')->middleware('can:users.invite,user');
Route::get(
  '/users/{user}/invite/{provider}',
  'UsersController@showInvitation'
)->name('users.showInvitation')->middleware('can:users.invite,user');
