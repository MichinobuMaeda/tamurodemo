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

Route::get(
  '/',
  'HomeController@index'
)->name('home');

Route::view(
  '/security_policy',
  'security_policy'
)->name('security_policy');

Route::view(
  'login',
  'login_select'
)->name('login.select')->middleware('guest');

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

Route::get(
  'login/email',
  'EMailLoginController@show'
)->name('login.email');
Route::post(
  'login/email',
  'EMailLoginController@send'
)->name('login.email.send')->middleware('guest');
Route::get(
  'login/email/{user}/{token}',
  'EMailLoginController@login'
)->name('login.email.token')->middleware('guest');
Route::view(
  'login/facebook',
  'login_facebook'
)->name('login.facebook')->middleware('guest');
Route::view(
  'login/yahoojp',
  'login_yahoo_jp'
)->name('login.yahoo_jp')->middleware('guest');
Route::view(
  'login/google',
  'login_google'
)->name('login.google')->middleware('guest');

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
)->name('get.registration');
Route::post(
  'registrations',
  'RegistrationController@register'
)->name('post.registration');

Route::post(
  'oAuthLogin',
  'OAuthLoginController@login'
)->name('oAuthLogin');

Route::get(
  'preferences/login',
  'UsersController@showPreferenceLogin'
)->name('get.preferences.login');
Route::view(
  'preferences/login/email',
  'login_edit_email'
)->name('get.preferences.login.email')->middleware('auth');
Route::post(
  'preferences/login/email',
  'UsersController@savePreferenceLoginEmail'
)->name('post.preferences.login.email');
Route::view(
  'preferences/login/password',
  'login_edit_password'
)->name('get.preferences.login.password')->middleware('auth');
Route::post(
  'preferences/login/password',
  'UsersController@savePreferenceLoginPassword'
)->name('post.preferences.login.password');
