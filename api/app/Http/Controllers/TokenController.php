<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Repositories\CertRepository;
use App\Repositories\TokenRepository;
use App\Http\ResponseFormatter as Resp;

class TokenController extends Controller
{
    /** The cert repository instance. */
    protected $certs;
    /** The token repository instance. */
    protected $tokens;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct(CertRepository $certs, TokenRepository $tokens)
    {
        $this->certs = $certs;
        $this->tokens = $tokens;
    }

    /**
     * Retrieve the all tokens.
     *
     * @return Response
     */
    public function show()
    {
        return Resp::json($this->tokens->list());
    }

    /**
     * Create a new token.
     *
     * @param Request $request
     * @return Response
     */
    public function create(Request $request)
    {
        $cert = $this->certs->get(
            $request->input('provider'),
            $request->input('key'),
            $request->input('secret', null)
        );

        return $cert
            ? response()->json([
                'me' => $this->tokens->create($cert),
                'data' => []]
            )
            : Resp::unauthorized_401();
    }
}
