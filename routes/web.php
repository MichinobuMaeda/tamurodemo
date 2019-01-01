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

Route::view(
  '/login',
  'login_select'
)->name('login_select')->middleware('guest');

Route::get(
  'login/password',
  'Auth\LoginController@showLoginForm'
)->name('login');
Route::post(
  'login/password',
  'Auth\LoginController@login'
);
Route::post(
  'logout',
  'Auth\LoginController@logout'
)->name('logout');
Route::get(
  'password/reset',
  'Auth\ForgotPasswordController@showLinkRequestForm'
)->name('password.request');
Route::post(
  'password/email',
  'Auth\ForgotPasswordController@sendResetLinkEmail'
)->name('password.email');
Route::get(
  'password/reset/{token}',
  'Auth\ResetPasswordController@showResetForm'
)->name('password.reset');
Route::post(
  'password/reset',
  'Auth\ResetPasswordController@reset'
)->name('password.update');

Route::view(
  '/login/google',
  'login_google'
)->name('login_google')->middleware('guest');

Route::view(
  '/login/facebook',
  'login_facebook'
)->name('login_facebook')->middleware('guest');

Route::get(
  '/',
  'HomeController@index'
)->name('home');

Route::get(
  'users',
  'UsersController@list'
)->name('users.list')->middleware('can:users.list');
Route::get(
  'users/orderBy/{orderBy}/orderDir/{orderDir}',
  'UsersController@list'
)->name('users.list.orderBy')->middleware('can:users.list');

Route::post(
  'invitations/{user}',
  'InvitationController@invite'
)->name('post.invitation')->middleware('can:users.invite,user');
Route::get(
  'invitations/{user}/{sendBy}',
  'InvitationController@show'
)->name('get.invitation')->middleware('can:users.invite,user');
Route::get(
  'registrations/{user}/{token}/{provider_name?}',
  'RegistrationController@viewInvitation'
)->name('users.invitations');
Route::post(
  'registrations/{user}',
  'RegistrationController@register'
)->name('post.registration');

Route::post(
  'oAuthLogin',
  'OAuthLoginController@login'
)->name('oAuthLogin');
