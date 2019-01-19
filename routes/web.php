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
)->name('security_policy')->middleware('history');

# Login / Logout

Route::view(
  'login',
  'auth.login_select'
)->name('list.logins')->middleware('guest');

Route::post(
  'logout',
  'Auth\LoginController@logout'
)->name('logout');

Route::get(
  'login/password',
  'Auth\LoginController@showLoginForm'
)->name('login');
Route::post(
  'login/password',
  'Auth\LoginController@login'
);

Route::get(
  'login/oauth/{provider}',
  'OAuthLoginController@show'
)->name('login.oauth');
Route::post(
  'login/oauth/{provider}',
  'OAuthLoginController@login'
);

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

# Groups

Route::get(
  'groups',
  'GroupsController@list'
)->name('groups')->middleware('can:groups.all')->middleware('history');

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
  'groups/{group}/higherGroups',
  'GroupsController@showHigherGroupsForm'
)->name('group.higherGroups')->middleware('can:groups.all')->middleware('history');
Route::put(
  'groups/{group}/higherGroups',
  'GroupsController@saveHigherGroups'
)->middleware('can:groups.all');

Route::get(
  'groups/{group}/subgroups',
  'GroupsController@showSubgroupsForm'
)->name('group.subgroups')->middleware('can:groups.all')->middleware('history');
Route::put(
  'groups/{group}/subgroups',
  'GroupsController@saveSubgroups'
)->middleware('can:groups.all');

Route::get(
  'groups/{group}/managers',
  'GroupsController@showManagersForm'
)->name('group.managers')->middleware('can:groups.all')->middleware('history');
Route::put(
  'groups/{group}/managers',
  'GroupsController@saveManagers'
)->middleware('can:groups.all');

Route::get(
  'groups/{group}/members',
  'GroupsController@showMembersForm'
)->name('group.members')->middleware('can:groups.update,group')->middleware('history');
Route::put(
  'groups/{group}/members',
  'GroupsController@saveMembers'
)->middleware('can:groups.update,group');

Route::get(
  'groups/new/create',
  'GroupsController@showCreateForm'
)->name('group.create.form')->middleware('can:groups.create');
Route::post(
  'groups',
  'GroupsController@create'
)->name('groups')->middleware('can:groups.create');

Route::delete(
  'groups/{group}',
  'GroupsController@delete'
)->middleware('can:groups.delete,group');
Route::get(
  'groups/{idDeleted}/restoreDeleted',
  'GroupsController@restoreDeleted'
)->name('group.restoreDeleted')->middleware('can:groups.create');
Route::get(
  'groups/{idDeleted}/deletePermanently',
  'GroupsController@deletePermanently'
)->name('group.deletePermanently')->middleware('can:groups.deletePermanently');

# Users

Route::get(
  'users',
  'UsersController@list'
)->name('users')->middleware('can:users.list')->middleware('history');

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
  'users/{user}/managingGroups',
  'UsersController@showManagingGroupsForm'
)->name('user.managingGroups')->middleware('can:groups.all')->middleware('history');
Route::put(
  'users/{user}/managingGroups',
  'UsersController@saveManagingGroups'
)->middleware('can:groups.all');

Route::get(
  'users/{user}/groups',
  'UsersController@showGroupsForm'
)->name('user.groups')->middleware('can:groups.all')->middleware('history');
Route::put(
  'users/{user}/groups',
  'UsersController@saveGroups'
)->middleware('can:groups.all');

Route::get(
  'users/new/create',
  'UsersController@showCreateForm'
)->name('user.create.form')->middleware('can:users.create');
Route::post(
  'users',
  'UsersController@create'
)->middleware('can:users.create');

Route::delete(
  'users/{user}',
  'UsersController@delete'
)->middleware('can:users.delete,user');
Route::get(
  'users/{idDeleted}/restoreDeleted',
  'UsersController@restoreDeleted'
)->name('user.restoreDeleted')->middleware('can:users.create');
Route::get(
  'users/{idDeleted}/deletePermanently',
  'UsersController@deletePermanently'
)->name('user.deletePermanently')->middleware('can:users.deletePermanently');

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

# Invitation / Registration

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

# Preferences of the logged-in user

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

# System administration

Route::get(
  'sysadmin',
  'SysAdminController@showMenu'
)->name('sysadmin')->middleware('can:system.administrate')->middleware('history');

# Page go back / go forward

Route::get(
  'pages/back',
  'PageController@back'
)->name('page.back');

Route::get(
  'pages/forward',
  'PageController@forward'
)->name('page.forward');
