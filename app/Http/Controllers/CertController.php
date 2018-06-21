<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Cert;
use App\Repositories\CertRepository;
use App\Http\ResponseFormatter as Resp;

class CertController extends Controller
{
    /** The cert repository instance. */
    protected $certs;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(CertRepository $certs)
    {
        $this->certs = $certs;
    }

    /**
     * Set the cert of the user.
     *
     * @param Request $request
     * @param int $user_id
     * @param string $provider
     * @return Response
     */
    public function set(Request $request, $user_id, $provider)
    {
        $user = User::where('id', $user_id)->first();
        if (!$user)
        {
            return Resp::not_found_404();
        }
        $certs = $this->certs->set(
            $user,
            $provider,
            $request->input('ver'),
            $request->input('key'),
            $request->input('secret', null)
        );
        return $certs
            ? $certs
            : Resp::conflict_409();
    }

    /**
     * List certs of the user.
     *
     * @param int $user_id
     * @return Response
     */
    public function list($user_id)
    {
        $user = User::where('id', $user_id)->first();
        return $user
            ? $this->certs->list($user)
            : Resp::not_found_404();
    }

    protected function filter_certs($certs)
    {
        $ret = [];
        foreach ($certs as $cert)
        {
            $ret[] = [
                'provider' => $cert->provider,
                'key' => $cert->provider == 'password' ? $cert->key : null,
                'ver' => $cert->ver
            ];
        }
        return $ret;
    }
}
