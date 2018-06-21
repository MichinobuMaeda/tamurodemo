<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMembersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('members', function (Blueprint $table) {
            $table->integer('group_id')->nullable(false);
            $table->integer('user_id')->nullable(false);
            $table->timestamp('linked_at')->useCurrent();
            $table->primary(['group_id', 'user_id']);
            $table->foreign('group_id')->references('id')
                    ->on('groups')->onDelete('cascade');
            $table->foreign('user_id')->references('id')
                    ->on('users')->onDelete('cascade');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('members');
    }
}
