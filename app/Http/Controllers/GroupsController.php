<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\GroupsService;
use App\Services\PageHistoryService;

use App\Group;
use App\GroupRole;
use App\User;

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
     * Show higher groups form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showHigherGroupsForm(Request $request, $group)
    {
        return view('group_higher_groups', [
            'group' => $group,
            'selected' => $this->getActiveIds($group->higherGroups()->get()),
            'list' => Group::where('id', '<>', $group->id)->orderBy('name')->get(),
        ]);
    }

    /**
     * Save higher groups.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function saveHigherGroups(Request $request, $group)
    {
        $this->svc->saveHigherGroups($group, $this->getSelectedIds($request->input()));
        return redirect()->route('group.higherGroups', ['group' => $group->id]);
    }

    /**
     * Show subgroups form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showSubgroupsForm(Request $request, $group)
    {
        return view('group_subgroups', [
            'group' => $group,
            'selected' => $this->getActiveIds($group->subgroups()->get()),
            'list' => Group::whereDoesntHave('roles', function ($query) {
                $query->where('name', GroupRole::PRIMARY);
            })->where('id', '<>', $group->id)->orderBy('name')->get(),
        ]);
    }

    /**
     * Save subgroups.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function saveSubgroups(Request $request, $group)
    {
        $this->svc->saveSubgroups($group, $this->getSelectedIds($request->input()));
        return redirect()->route('group.subgroups', ['group' => $group->id]);
    }

    /**
     * Show managers form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showManagersForm(Request $request, $group)
    {
        return view('group_managers', [
            'group' => $group,
            'selected' => $this->getActiveIds($group->managers()->get()),
            'list' => User::orderBy('name')->get(),
        ]);
    }

    /**
     * Save managers.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function saveManagers(Request $request, $group)
    {
        $this->svc->saveManagers($group, $this->getSelectedIds($request->input()));
        return redirect()->route('group.managers', ['group' => $group->id]);
    }

    /**
     * Show members form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showMembersForm(Request $request, $group)
    {
        return view('group_members', [
            'group' => $group,
            'selected' => $this->getActiveIds($group->members()->get()),
            'list' => User::orderBy('name')->get(),
        ]);
    }

    /**
     * Save members.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function saveMembers(Request $request, $group)
    {
        $this->svc->saveMembers($group, $this->getSelectedIds($request->input()));
        return redirect()->route('group.members', ['group' => $group->id]);
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
     * Create group.
     * 
     * @param Request $request
     * @return Response
     */
    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'higher' => 'required|integer|exists:groups,id',
            'name' => 'required|unique:groups,name',
        ]);
        $model = $this->svc->create(
            intval($request->input('higher')),
            $request->input('name'),
            $request->input('desc')
        );
        return redirect()->route('group', ['group' => $model->id]);
    }
}
