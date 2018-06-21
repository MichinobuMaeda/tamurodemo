<?php

namespace App\Repositories;

use Datetime;
use DateInterval;
use App\Models\Group;
use App\Models\Token;

class TokenRepository
{
    /**
     * Create a new token.
     * 
     * @param Cert $cert.
     * @return User the token owner.
     */
    public function create($cert)
    {
        $token = new Token;
        $token->user_id = $cert->user_id;
        $token->provider = $cert->provider;
        $token->signature = $this->hash_signature($cert->user_id);
        $token->save();
        return $this->get_token_owner($token);
    }
    /**
     * List tokens.
     * 
     * @return array tokens.
     */
    public function list()
    {
        return Token::orderBy('updated_at', 'desc')
            ->where('updated_at', '>', $this->get_expired_timestamp())
            ->get();
    }

    /**
     * Touch the token and get the token owner.
     * 
     * @param string $signature the signature.
     * @return User the token owner.
     */
    public function touch($signature)
    {
        $token = Token::where([
            ['signature', '=', $signature],
            ['updated_at', '>', $this->get_expired_timestamp()]
        ])->first();
        if (!$token) {
            return null;
        }

        $token->updated_at = new DateTime();
        $token->save();
        return $this->get_token_owner($token);
    }

    protected function get_expired_timestamp()
    {
        return (new DateTime())->add(
            DateInterval::createFromDateString(env('EXPIRED_TOKEN'))
        );
    }

    protected function get_token_owner($token)
    {
        $user = $token->user()->first();
        if (!$user) { return null; }

        $user->provider = $token->provider;
        $user->token = $token->signature;
        $user->managerOf = ($user->provider == 'temp')
            ? []
            : $this->get_sub_groups(
                Group::join('group_owners', 'groups.id', '=', 'group_owners.group_id')
                    ->where('group_owners.user_id', $user->id)
                    ->get()
            );
        $user->memberOf = ($user->provider == 'temp')
            ? []
            : $this->get_upper_groups(
                Group::join('members', 'groups.id', '=', 'members.group_id')
                    ->where('members.user_id', $user->id)
                    ->get()
            );
        return $user;
    }

    protected function get_upper_groups($groups)
    {
        if (!$groups) {
            return [];
        }
        $belongs_to = Group::join('sub_groups', 'groups.id', '=', 'sub_groups.group_id')
            ->whereIn('sub_groups.sub_group_id', $this->get_ids($groups))
            ->whereNotIn('sub_groups.group_id', $this->get_ids($groups))
            ->get();
        return count($belongs_to)
                ? $this->get_upper_groups($groups->merge($belongs_to))
                : $groups;
    }
    
    protected function get_sub_groups($groups)
    {
        if (!$groups) {
            return [];
        }
        $owned = Group::join('sub_groups', 'groups.id', '=', 'sub_groups.sub_group_id')
            ->whereIn('sub_groups.group_id', $this->get_ids($groups))
            ->whereNotIn('sub_groups.sub_group_id', $this->get_ids($groups))
            ->get();
        return count($owned)
            ? $this->get_sub_groups($groups->merge($owned))
            : $groups;
    }
    
    protected function get_ids($groups)
    {
        $ret = [];
        foreach ($groups as $group)
        {
            $ret[] = $group->id;
        }
        return $ret;
    }

    protected function hash_signature($user_id)
    {
        $ts = microtime(TRUE);
        return hash(
            'sha256',
            sprintf("%f %s %x", $ts, env('APP_KEY'), $user_id)
        );
    }
}
