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

Route::get(
  '/',
  'HomeController@index'
)->name('home');

Route::get(
  '/users',
  'UsersController@list'
)->name('users.list')->middleware('can:users.list');
Route::get(
  '/users/orderBy/{orderBy}/orderDir/{orderDir}',
  'UsersController@list'
)->name('users.list.orderBy')->middleware('can:users.list');

Route::post(
  '/invitations/{user}',
  'InvitationController@invite'
)->name('post.invitation')->middleware('can:users.invite,user');
Route::get(
  '/invitations/{user}/{sendBy}',
  'InvitationController@show'
)->name('get.invitation')->middleware('can:users.invite,user');
Route::get(
  '/registrations/{user}/{token}',
  'RegistrationController@viewInvitation'
)->name('users.invitations');
Route::post(
  '/registrations/{user}',
  'RegistrationController@register'
)->name('post.registration');

Route::post(
  '/oAuthLogin',
  'OAuthLoginController@login'
)->name('oAuthLogin');
