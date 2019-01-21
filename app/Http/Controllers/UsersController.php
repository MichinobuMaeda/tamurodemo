<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Services\UsersService;
use App\Services\OAuthService;
use App\Services\PageHistoryService;
use App\Group;
use App\User;

class UsersController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param UsersService
     * @param OAuthService
     * @return void
     */
    public function __construct(UsersService $svc, OAuthService $oauth)
    {
        $this->middleware('auth');
        $this->svc = $svc;
        $this->oauth = $oauth;
    }

    /**
     * Show user list.
     *
     * @param Request $request
     * @return Response
     */
    public function list(Request $request)
    {
        $orderBy = $request->input('orderBy');
        $orderDir = $request->input('orderDir');
        $withTrashed = $request->input('withTrashed');

        if ($orderBy) {
            session(['users_list.orderBy' => $orderBy]);
        }
        if ($orderDir) {
            session(['users_list.orderDir' => $orderDir]);
        }
        if ($withTrashed) {
            session(['users_list.withTrashed' => $withTrashed]);
        }
        $orderBy = session('users_list.orderBy', 'name');
        $orderDir = session('users_list.orderDir', 'asc');
        $withTrashed = session('users_list.withTrashed', 'false') == 'true';

        return view('users_list', [
            'users' => $this->svc->list($orderBy, $orderDir, $withTrashed),
            'loginMethods' => $this->svc->listLoginMethods(),
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
            'withTrashed' => $withTrashed,
        ]);
    }

    /**
     * Show user.
     *
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function show(Request $request, User $user)
    {
        return view('user', [
            'user' => $user,
        ]);
    }

    /**
     * Show the user's profile editor.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function showProfileForm(Request $request, User $user)
    {
        return view('user_profile', [
            'user' => $user,
        ]);
    }

    /**
     * Save the user's profile.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function saveProfile(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'name' => [
                'required',
                Rule::unique('users')->ignore($user->id),
            ],
        ]);
        $this->svc->saveProfile(
            $user,
            $request->input('name'),
            $request->input('desc'),
            $request->input('timezone')
        );
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * Show managing groups form.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function showManagingGroupsForm(Request $request, User $user)
    {
        return view('user_managing_groups', [
            'user' => $user,
            'selected' => $this->getActiveIds($user->managingGroups()->get()),
            'list' => Group::orderBy('name')->get(),
        ]);
    }

    /**
     * Save managing groups.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function saveManagingGroups(Request $request, User $user)
    {
        $this->svc->saveManagingGroups($user, $this->getSelectedIds($request->input()));
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * Show groups form.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function showGroupsForm(Request $request, User $user)
    {
        return view('user_groups', [
            'user' => $user,
            'selected' => $this->getActiveIds($user->groups()->get()),
            'list' => Group::orderBy('name')->get(),
        ]);
    }

    /**
     * Save groups.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function saveGroups(Request $request, User $user)
    {
        $this->svc->saveGroups($user, $this->getSelectedIds($request->input()));
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * @param Collection $records
     * @return array
     */
    public function getActiveIds($records)
    {
        $selected = [];
        foreach($records as $item) {
            $selected[] = $item->id;
        }
        return $selected;
    }

    /**
     * @param array $inputs
     * @return array
     */
    public function getSelectedIds($inputs)
    {
        $matches = null;
        $selected = [];
        foreach (array_keys($inputs) as $key) {
            if (preg_match("/^i([0-9]+)$/", $key, $matches)) {
                $selected[] = intval($matches[1]);
            }
        }
        return $selected;
    }

    /**
     * Show create user form.
     * 
     * @param Request $request
     * @return Response
     */
    public function showCreateForm(Request $request)
    {
        return view('user_new', ['groups' => Group::orderBy('name')->get()]);
    }

    /**
     * Create user.
     * 
     * @param Request $request
     * @return Response
     */
    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'higher' => 'required|integer|exists:groups,id',
            'name' => 'required|unique:users,name',
        ]);
        $model = $this->svc->create(
            intval($request->input('higher')),
            $request->input('name'),
            $request->input('desc'),
            $request->input('timezone')
        );
        return redirect()->route('user', ['user' => $model->id]);
    }

    /**
     * Delete user.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function delete(Request $request, User $user)
    {
        $user->delete();
        return redirect()->route('users');
    }

    /**
     * Restore deleted user.
     * 
     * @param Request $request
     * @param String $idDeleted
     * @return Response
     */
    public function restoreDeleted(Request $request, $idDeleted)
    {
        User::withTrashed()
            ->where('id', intval($idDeleted))
            ->restore();
        return redirect()->route('users');
    }

    /**
     * Delete permanently deleted user.
     * 
     * @param Request $request
     * @param String $idDeleted
     * @return Response
     */
    public function deletePermanently(Request $request, $idDeleted)
    {
        User::withTrashed()
            ->where('id', intval($idDeleted))
            ->forceDelete();
        return redirect()->route('users');
    }

    /**
     * Show the user's login methods editor.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function showEditLoginForm(Request $request, User $user)
    {
        if ($user->id == Auth::user()->id) {
            $svc = new PageHistoryService($request->session());
            $url = $svc->back();
                return redirect()->route('preferences.login');
        }
        return view('user_login', [
            'user' => $user,
            'loginMethods' => $this->svc->listUserLoginMethods($user),
        ]);
    }

    /**
     * Save the user's e-mail address.
     * 
     * @param Request $request
     * @param App\User $user
     * @return Response
     */
    public function saveLoginEmail(Request $request, User $user)
    {
        $validatedData = $request->validate([
            'email' => 'nullable|email',
        ]);
        $this->svc->saveLoginEmail($user, $request->input('email'));
        return redirect()->route('user.login', ['user' => $user->id]);
    }

    /**
     * Reset the user's OAuth provider.
     * 
     * @param Request $request
     * @param App\User $user
     * @param string $provider
     * @return Response
     */
    public function resetLoginProvider(Request $request, User $user, $provider)
    {
        $this->oauth->reset($user, $provider);
        return redirect()->route('user.login', ['user' => $user->id]);
    }
}
