<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProfPropsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('prof_props', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('user_id')->nullable(false);
            $table->text('prof_id')->nullable(false);
            $table->text('prop_id')->nullable(false);
            $table->text('value')->nullable(true);
            $table->integer('ver')->nullable(false)->default(1);
            $table->timestamps();
            $table->unique(['user_id', 'prof_id', 'prop_id']);
            $table->foreign(['user_id', 'prof_id'])
                ->references(['user_id', 'prof_id'])
                ->on('profs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('prof_props');
    }
}
