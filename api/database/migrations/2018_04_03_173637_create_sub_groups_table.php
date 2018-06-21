<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSubGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sub_groups', function (Blueprint $table) {
            $table->integer('group_id')->nullable(false);
            $table->integer('sub_group_id')->nullable(false);
            $table->timestamp('linked_at')->useCurrent();
            $table->primary(['group_id', 'sub_group_id']);
            $table->foreign('group_id')->references('id')
                ->on('groups')->onDelete('cascade');
            $table->foreign('sub_group_id')->references('id')
                ->on('groups')->onDelete('cascade');
            $table->index('sub_group_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sub_groups');
    }
}
