<?php

namespace App\Policies;

use App\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the model.
     *
     * @param  \App\User  $user
     * @param  \App\Group  $model
     * @return mixed
     */
    public function view(User $user, User $model)
    {
        return !!$user;
    }

    /**
     * Determine whether the user can create models.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function create(User $user)
    {
        return $user->isManagerOfAll();
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function update(User $user, User $model)
    {
        return $user->id == $model->id
            || $user->isManagerOfAll();
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function delete(User $user, User $model)
    {
        return $user->isManagerOfAll();
    }

    /**
     * Determine whether the user can delete permanently the soft deleted model.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function deletePermanently(User $user)
    {
        return $user->isManagerOfAll();
    }

    /**
     * Determine whether the user can list models.
     *
     * @param  \App\User  $user
     * @return mixed
     */
    public function list(User $user)
    {
        return $user->isManagerOfAll();
    }

    /**
     * Determine whether the user can invite the model.
     *
     * @param  \App\User  $user
     * @param  \App\User  $model
     * @return mixed
     */
    public function invite(User $user, User $model)
    {
        return $user->isManagerOfAll();
    }
}
