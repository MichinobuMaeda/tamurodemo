<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
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
     * Show group list.
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
            session(['groups_list.orderBy' => $orderBy]);
        }
        if ($orderDir) {
            session(['groups_list.orderDir' => $orderDir]);
        }
        if ($withTrashed) {
            session(['groups_list.withTrashed' => $withTrashed]);
        }
        $orderBy = session('groups_list.orderBy', 'name');
        $orderDir = session('groups_list.orderDir', 'asc');
        $withTrashed = session('groups_list.withTrashed', 'false') == 'true';

        return view('groups_list', [
            'groups' => $this->svc->list($orderBy, $orderDir, $withTrashed),
            'orderBy' => $orderBy,
            'orderDir' => $orderDir,
            'withTrashed' => $withTrashed,
        ]);
    }

    /**
     * Show the application dashboard.
     *
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function show(Request $request, Group $group)
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
    public function showProfileForm(Request $request, Group $group)
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
    public function saveProfile(Request $request, Group $group)
    {
        $validatedData = $request->validate([
            'name' => [
                'required',
                Rule::unique('groups')->ignore($group->id),
            ],
        ]);
        $this->svc->saveProfile(
            $group,
            $request->input('name'),
            $request->input('desc')
        );
        return redirect()->away((new PageHistoryService($request->session()))->back());
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
    public function showHigherGroupsForm(Request $request, Group $group)
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
    public function saveHigherGroups(Request $request, Group $group)
    {
        $this->svc->saveHigherGroups($group, $this->getSelectedIds($request->input()));
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * Show subgroups form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showSubgroupsForm(Request $request, Group $group)
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
    public function saveSubgroups(Request $request, Group $group)
    {
        $this->svc->saveSubgroups($group, $this->getSelectedIds($request->input()));
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * Show managers form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showManagersForm(Request $request, Group $group)
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
    public function saveManagers(Request $request, Group $group)
    {
        $this->svc->saveManagers($group, $this->getSelectedIds($request->input()));
        return redirect()->away((new PageHistoryService($request->session()))->back());
    }

    /**
     * Show members form.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function showMembersForm(Request $request, Group $group)
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
    public function saveMembers(Request $request, Group $group)
    {
        $this->svc->saveMembers($group, $this->getSelectedIds($request->input()));
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

    /**
     * Delete group.
     * 
     * @param Request $request
     * @param App\Group $group
     * @return Response
     */
    public function delete(Request $request, Group $group)
    {
        $group->delete();
        return redirect()->route('groups');
    }

    /**
     * Restore deleted group.
     * 
     * @param Request $request
     * @param String $idDeleted
     * @return Response
     */
    public function restoreDeleted(Request $request, $idDeleted)
    {
        Group::withTrashed()
            ->where('id', intval($idDeleted))
            ->restore();
        return redirect()->route('groups');
    }

    /**
     * Delete permanently deleted group.
     * 
     * @param Request $request
     * @param String $idDeleted
     * @return Response
     */
    public function deletePermanently(Request $request, $idDeleted)
    {
        Group::withTrashed()
            ->where('id', intval($idDeleted))
            ->forceDelete();
        return redirect()->route('groups');
    }
}
