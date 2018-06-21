<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProfPropPrivsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('prof_prop_privs', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->nullable(false);
            $table->text('prof_id')->nullable(false);
            $table->text('prop_id')->nullable(false);
            $table->integer('group_id')->nullable(false);
            $table->integer('ver')->nullable(false)->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'prof_id', 'prop_id', 'group_id']);
            $table->foreign(['user_id', 'prof_id', 'prop_id'])
                ->references(['user_id', 'prof_id', 'prop_id'])
                ->on('prof_props')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('prof_prop_privs');
    }
}
