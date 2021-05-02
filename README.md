Tamuro デモ用ソース
==========

- [Prerequisites](docs/prerequisites.md)
- [Development environment](docs/dev.md)
- [Create this project](docs/project.md)

[![codecov](https://codecov.io/gh/MichinobuMaeda/tamurodemo/branch/master/graph/badge.svg?token=BwGnjvAxsk)](https://codecov.io/gh/MichinobuMaeda/tamurodemo)

開発用のリポジトリは https://github.com/MichinobuMaeda/tamuro です。

デモ用アプリは https://tamuro02.web.app/ です。

## 1. 必要なもの

[Prerequisites](docs/prerequisites.md)

- git
- node.js ( v12 〜 )
- java ( OpenJDK の JRE でよい )

### 1.1. Debian 10 の場合

Node.js は

- NVM 使って複数のバージョンの Node.js をインストールする。
- 新ししいバージョンの Node.js を入れて n で古いバージョンに切り替える。

のどちらかの方法でバージョンを切り替えができるようにする。以下は n  を使う例。

`apt` コマンドでは Node.js の古いバージョンが入ってしまうので [h ttps://github.com/nodesource/distributions/blob/master/README.md](https://github.com/nodesource/distributions/blob/master/README.md)

の手順で入れる。LTS ( Long time support ) の 14 または 16 が無難。

```bash
$ sudo apt update
$ sudo apt install git
$ git --version
git version ...

$ npm -g install npm n
$ n 12
$ node --version
v12....
$ npm -g install firebase-tools jest eslint @vue/cli

$ sudo apt install default-jre
$ java -version
openjdk version "11..."
```

初めて git を使う場合はユーザ名とメールアドレスを設定すること。

```bash
$ git config --global user.name "FIRST_NAME LAST_NAME"
$ git config --global user.email "MY_NAME@example.com"
```

### 1.2 Windows の場合

WSL 2 を利用するのが無難。その場合は Linux と同じ。
[https://docs.microsoft.com/ja-jp/windows/wsl/install-win10](https://docs.microsoft.com/ja-jp/windows/wsl/install-win10)

それ以外の場合は Chocolatey ( [https://chocolatey.org/](https://chocolatey.org/) ) を利用するのが現実的。個別にインストールするよりマシだがそこそこたいへん。 Node.js の `n` は Windows に対応していないので バージョンは 12 を指定してインストールする。 NVM については未確認。

```bash
$ sudo apt update
$ sudo apt install git
$ git --version
git version ...

$ npm -g install npm n
$ n 12
$ node --version
v12....
$ npm -g install firebase-tools jest eslint @vue/cli

$ sudo apt install default-jre
$ java -version
openjdk version "11..."
```

初めて git を使う場合はユーザ名とメールアドレスを設定すること。

```bash
$ git config --global user.name "FIRST_NAME LAST_NAME"
$ git config --global user.email "MY_NAME@example.com"
```

### 1.2 Windows の場合

WSL 2 を利用するのが無難。その場合は Linux と同じ。
[https://docs.microsoft.com/ja-jp/windows/wsl/install-win10](https://docs.microsoft.com/ja-jp/windows/wsl/install-win10)

それ以外の場合は Chocolatey ( [https://chocolatey.org/](https://chocolatey.org/) ) を利用するのが現実的。個別にインストールするよりマシだがそこそこたいへん。 Node.js の `n` は Windows に対応していないので バージョンは 12 を指定してインストールする。

### 1.3. Mac の場合

`homebrew` ( [https://brew.sh/](https://brew.sh/) ) を使うのが無難。
Node.js も Java もデフォルトでインストールされる最新でよい。

## 2. 開発環境の設定

[https://github.com/MichinobuMaeda/tamuro/blob/master/docs/dev.md](https://github.com/MichinobuMaeda/tamuro/blob/master/docs/dev.md)

## 3. 自分でプロジェクトを作る手順

元のプロジェクト

- GitHub のリポジトリ MichinobuMaeda/tamuro
- Firebase のプロジェクト tamuro01

複製するデモ用のプロジェクト

- GitHub のリポジトリ yourname/tamurodemo
- Firebase のプロジェクト tamuroYourName

### 3.1. Firebase のプロジェクトの作成

Google Cloud のアカウントがなければ作成する。

Google Cloud の支払い方法に自分のクレジットカードを登録する。 Functions を利用するために必要。 Tamuro のテストで実際に請求が発生することはたぶんない。あるとしても数円とか数10円くらい。

[Create this project](docs/project.md)

### 3.2. GitHub リポジトリの作成

GitHub のアカウントがなければ作成する。

[https://github.com/MichinobuMaeda/tamuro](https://github.com/MichinobuMaeda/tamuro) を Fork して自分のアカウントにコピーする。
Fork の手順は [https://docs.github.com/ja/github/getting-started-with-github/fork-a-repo](https://docs.github.com/ja/github/getting-started-with-github/fork-a-repo)

私自身は自分のリポジトリを Fork できないので以下の手順でコピーを作成した。
[https://github.com/youraccount](https://github.com/youraccount) で New repository を選択

![New repository](./newrepo.png)

Repository name: tamurodemo として [Create repository]

```bash
$ git clone git@github.com:MichinobuMaeda/tamuro.git
$ mv tamuro tamurodemo
$ cd tamurodemo/
$ git remote set-url origin git@github.com:yourname/tamurodemo.git
$ git push
$ git remote add upstream git@github.com:MichinobuMaeda/tamuro.git
```

元のリポジトリから最新の差分を適用するには

```bash
$ git pull upstream master
```

### 3.3. デモ用にソースを変更

Firebase のプロジェクトを変更する。

```bash
$ grep -r tamuro01 .
./tools/setupTestService.js:const projectId = 'tamuro01'
./tools/setupTestService.js:    uri: 'http://localhost:9099/emulator/v1/projects/tamuro01/accounts',
./tools/env.js:const projectId = 'tamuro01'
./.firebaserc:    "default": "tamuro01"
./tests/unit/_testUtils.js:const projectId = 'tamuro01'
./tests/unit/functions/_testUtils.js:const projectId = 'tamuro01'
./.github/workflows/ui.yaml:        run: curl https://tamuro01.web.app/updateServiceVersion\?key\=$API_KEY
./functions/initialData.js:      hosting: 'https://tamuro01.web.app',
./src/plugins/firebase.js:  authDomain: 'tamuro01.firebaseapp.com',
./src/plugins/firebase.js:  projectId: 'tamuro01',
./src/plugins/firebase.js:  storageBucket: 'tamuro01.appspot.com',
```

"tamuro01" を "tamuroYourName" に全置換する。

```bash
$ firebase use tamuroYourName
Now using project tamuroYourName
```

Firebase のプロジェクトの "firebaseConfig" の apiKey 以外の値を src/plugins/firebase.js の変数 firebase に反映する。

Firebase のプロジェクトの "Web Push certificates" の "Key pair" の値を src/plugins/firebase.js の変数 webPushCertificateKey に反映する。

[https://github.com/MichinobuMaeda/tamuro/blob/master/docs/dev.md](https://github.com/MichinobuMaeda/tamuro/blob/master/docs/dev.md) の手順でローカルでの動作を確認する。ローカルでテストが通らない場合は、 GitHub に push してもActions でエラーになる。

public/img/icons/safari-pinned-tab.svg をデモ用に変更する。

```
$ node tools/resize-icons.js
```

で他の画像ファイルに変更を反映する。

以上の変更を git で push する。
