<?php

namespace App\Http;

use Illuminate\Support\Facades\Auth;

class ResponseFormatter
{
    public static function json($data)
    {
        return response()->json([
            'me' => Auth::user(),
            'data' => $data
        ]);
    }

    public static function unauthorized_401()
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    public static function forbidden_403()
    {
        return response()->json(['error' => 'Forbidden'], 403);
    }

    public static function not_found_404()
    {
        return response()->json(['error' => 'Not Found'], 404);
    }

    public static function conflict_409()
    {
        return response()->json(['error' => 'Conflict'], 409);
    }
}
