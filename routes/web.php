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
)->name('home')->middleware('history');

Route::view(
  '/security_policy',
  'security_policy'
)->name('security_policy');

Route::view(
  'login',
  'auth.login_select'
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

Route::get(
  'groups/{group}',
  'GroupsController@show'
)->name('group')->middleware('history');
Route::get(
  'groups/{group}/edit',
  'GroupsController@showProfileForm'
)->name('group.edit')->middleware('can:groups.update,group')->middleware('history');
Route::put(
  'groups/{group}',
  'GroupsController@saveProfile'
)->middleware('can:groups.update,group');

Route::get(
  'users/{user}',
  'UsersController@show'
)->name('user')->middleware('history');
Route::get(
  'users/{user}/edit',
  'UsersController@showProfileForm'
)->name('user.edit')->middleware('can:users.update,user')->middleware('history');
Route::put(
  'users/{user}',
  'UsersController@saveProfile'
)->middleware('can:users.update,user');
Route::get(
  'users',
  'UsersController@list'
)->name('users')->middleware('can:users.list')->middleware('history');
Route::get(
  'users/orderBy/{orderBy}/orderDir/{orderDir}',
  'UsersController@list'
)->name('users.orderBy')->middleware('can:users.list');

Route::get(
  'users/{user}/login',
  'UsersController@showEditLoginForm'
)->name('user.login')->middleware('can:users.update,user')->middleware('history');
Route::put(
  'users/{user}/login/email',
  'UsersController@saveLoginEmail'
)->name('user.login.email')->middleware('can:users.update,user');
Route::delete(
  'users/{user}/login/oauth/{provider}',
  'UsersController@resetLoginProvider'
)->name('user.login.oauth')->middleware('can:users.update,user');

Route::get(
  'invitations/{user}/{sendBy}/post',
  'InvitationController@invite'
)->name('invite')->middleware('can:users.invite,user');
Route::get(
  'invitations/{user}/{sendBy}',
  'InvitationController@show'
)->name('invitation')->middleware('can:users.invite,user');

Route::get(
  'registrations/{user}/{token}/{provider_name?}',
  'RegistrationController@viewInvitation'
)->name('registration');
Route::post(
  'registrations',
  'RegistrationController@register'
)->name('register');

Route::get(
  'login/oauth/{provider}',
  'OAuthLoginController@show'
)->name('login.oauth');
Route::post(
  'login/oauth/{provider}',
  'OAuthLoginController@login'
);

Route::get(
  'preferences/login',
  'PreferencesController@showEditLoginForm'
)->name('preferences.login')->middleware('history');

Route::view(
  'preferences/login/email',
  'preferences_email'
)->name('preferences.login.email')->middleware('auth')->middleware('history');;
Route::put(
  'preferences/login/email',
  'PreferencesController@saveLoginEmail'
);

Route::view(
  'preferences/login/password',
  'preferences_password'
)->name('preferences.login.password')->middleware('auth')->middleware('history');;
Route::put(
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

Route::get(
  'pages/back',
  'PageController@back'
)->name('page.back');

Route::get(
  'pages/forward',
  'PageController@forward'
)->name('page.forward');
