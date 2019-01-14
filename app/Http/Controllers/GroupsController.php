<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\GroupsService;
use App\Services\PageHistoryService;

use App\Group;
use App\GroupRole;

class GroupsController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(GroupsService $svc)
    {
        $this->middleware('auth');
        $this->svc = $svc;
    }

    /**
     * Show the application dashboard.
     *
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function show(Request $request, $group)
    {
        return $group->isPrimary()
            ? redirect()->route('home')
            : view('group', [
                'group' => $group,
            ]);
    }

    /**
     * Show the user's profile editor.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showProfileForm(Request $request, $group)
    {
        return view('group_profile', [
            'group' => $group,
        ]);
    }

    /**
     * Save the user's profile.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function saveProfile(Request $request, $group)
    {
        $validatedData = $request->validate([
            'name' => 'required|unique:users,name',
        ]);
        $this->svc->saveProfile(
            $group,
            $request->input('name'),
            $request->input('desc')
        );
        return redirect()->route('group.edit', ['group' => $group->id]);
    }

    /**
     * Show create group form.
     * 
     * @param Request $request
     * @return Response
     */
    public function showCreateForm(Request $request)
    {
        return view('group_new', ['groups' => Group::orderBy('name')->get()]);
    }

    /**
     * Create group.
     * 
     * @param Request $request
     * @return Response
     */
    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'upper' => 'required|integer|exists:groups,id',
            'name' => 'required|unique:groups,name',
        ]);
        $model = $this->svc->create(
            intval($request->input('upper')),
            $request->input('name'),
            $request->input('desc')
        );
        return redirect()->route('group', ['group' => $model->id]);
    }
}
