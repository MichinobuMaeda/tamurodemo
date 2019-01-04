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
)->name('list.logins')->middleware('guest');

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
)->name('list.users')->middleware('can:users.list');
Route::get(
  'users/orderBy/{orderBy}/orderDir/{orderDir}',
  'UsersController@list'
)->name('list.users.orderBy')->middleware('can:users.list');

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
  'PreferencesController@showLogin'
)->name('preferences.login');

Route::view(
  'preferences/login/email',
  'preferences_email'
)->name('preferences.login.email')->middleware('auth');
Route::post(
  'preferences/login/email',
  'PreferencesController@saveLoginEmail'
);

Route::view(
  'preferences/login/password',
  'preferences_password'
)->name('preferences.login.password')->middleware('auth');
Route::post(
  'preferences/login/password',
  'PreferencesController@saveLoginPassword'
);

Route::get(
  'preferences/oauth/{provider}',
  'PreferencesController@showOAuthProviders'
)->name('preferences.login.oauth');
Route::post(
  'preferences/oauth/{provider}',
  'PreferencesController@setLoginProvider'
);
Route::delete(
  'preferences/oauth/{provider}',
  'PreferencesController@resetLoginProvider'
);
