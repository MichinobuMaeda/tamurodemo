<?php

use Illuminate\Database\Seeder;
use App\Message;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Message::create([
            'key' => "Please select your favorite login method.",
            'locale' => 'ja',
            'message' => <<<EOT
ログイン方法を選択してください。
EOT
        ]);
        Message::create([
            'key' => "If you want to use another E-mail address, please contact your administrator.",
            'locale' => 'ja',
            'message' => <<<EOT
他のメールアドレスを使いたい場合は、管理者にご連絡ください。
EOT
        ]);
        Message::create([
            'key' => "If you want to login with E-mail address, please contact your administrator.",
            'locale' => 'ja',
            'message' => <<<EOT
メールアドレスを使ってログインしたい場合は、管理者にご連絡ください。
EOT
        ]);
        Message::create([
            'key' => "Please select the login method which you've registered.",
            'locale' => 'ja',
            'message' => <<<EOT
ログイン方法を選択してください。
招待の際に設定したものと、その後に自分で追加したものが利用できます。
EOT
        ]);
        Message::create([
            'key' => "If you have any troubles, please contact your administrator.",
            'locale' => 'ja',
            'message' => <<<EOT
お困りのことがありましたら、管理者にご連絡ください。
EOT
        ]);
    }
}
