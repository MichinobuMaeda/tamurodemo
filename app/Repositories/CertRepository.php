<?php

namespace App\Repositories;

use App\Models\Cert;

class CertRepository
{
    /**
     * Set the cert of the user.
     * 
     * @param User $user the user.
     * @param string $provider.
     * @param integer $ver.
     * @param string $key the user id for password auth.
     * @param string $secret the password.
     * @return array the certs of the user or null if any conflict detected.
     */
    public function set($user, $provider, $ver, $key, $secret = null)
    {
        $cert = Cert::where([
            ['user_id', '=', $user->id],
            ['provider', '=', $provider]
        ])->first();

        // detect conflict.
        if (((!$ver) && $cert) ||
            ($ver && (!$cert)) ||
            ($ver != $cert->ver)
        )
        {
            return null;
        }

        if (!$cert)
        {
            $cert = new Cert;
            $cert->provider = $provider;
            $cert->user()->associate($user);
        }
        else
        {
            ++ $cert->ver;
        }
        $cert->key = $key;
        $cert->secret = $secret
            ? $this->hash_secret($key, $secret)
            : null;
        $cert->save();
        return $this->list($user);
    }

    /**
     * Get the cert.
     *
     * @param string $key.
     * @param string $secret.
     * @return Cert the cert.
     */
    public function get($provider, $key, $secret = null)
    {
        return Cert::where($secret
            ? [
                ['provider', '=', $provider],
                ['key', '=', $key],
                ['secret', '=', $this->hash_secret($key, $secret)]
            ]
            : [
                ['provider', '=', $provider],
                ['key', '=', $key],
            ]
        )->first();
    }

    /**
     * List the cert of the user.
     *
     * @param User $user.
     * @return array the certs of the user.
     */
    public function list($user)
    {
        return Cert::where('user_id', $user->id)
            ->orderBy('user_id')
            ->orderBy('provider', 'desc')
            ->get();
    }

    /**
     * Delete the cert of the user.
     *
     * @param string $user_id.
     * @param string $provider.
     * @return array the certs.
     */
    public function delete($user_id, $provider)
    {
        Cert::where([
            ['user_id', '=', $user_id],
            ['provider', '=', $provider]
        ])->delete();
        return $this->list($user_id);
    }

    protected function hash_secret($key, $secret)
    {
        return hash(
            'sha256',
            sprintf("%s %s %x", $secret, env('APP_KEY'), $key)
        );
    }
}
