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
        Message::create([
            'key' => "If you do not receive the email within minutes, please contact the administrators.",
            'locale' => 'ja',
            'message' => <<<EOT
メールが数分以内に届かない場合は、管理者にご連絡ください。
EOT
        ]);
        Message::create([
            'key' => "Security notifications about EU ePrivacy directive and privacy policy ...",
            'locale' => 'ja',
            'message' => <<<EOT
このサイトは日本国内外の利用者を想定しているため、日本国の法令規制の他に EU 等の法規にも準拠して運用します。詳細についてはプライバシーポリシーをご参照ください。
このサイトでは以下の目的のために Cookie を利用しています。
(1) 認証の状態（ログイン／ログアウト）の保持。
(2) 利用者の入力中のデータの保持。
以上についてご了承の上、ログインしてください。
EOT
        ]);
        Message::create([
            'key' => "Description of security policy ...",
            'locale' => 'ja',
            'message' => <<<EOT
セキュリティポリシーについての説明の文章、１行目。
２行目。
３行目。
EOT
        ]);
    }
}
