<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {

            $table->string('title');
            $table->text('description')->nullable();

            $table->foreignId('category_id')
                  ->constrained('categories')
                  ->onDelete('cascade');

            $table->string('venue');

            $table->date('event_date');

            $table->time('start_time');
            $table->time('end_time');

            $table->foreignId('organizer_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->unsignedInteger('maximum_capacity');

            $table->string('banner')->nullable();

            $table->dateTime('registration_deadline')->nullable();

            $table->enum('status', [
                'Upcoming',
                'Ongoing',
                'Completed',
                'Cancelled'
            ])->default('Upcoming');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {

            $table->dropForeign(['category_id']);
            $table->dropForeign(['organizer_id']);

            $table->dropColumn([
                'title',
                'description',
                'category_id',
                'venue',
                'event_date',
                'start_time',
                'end_time',
                'organizer_id',
                'maximum_capacity',
                'banner',
                'registration_deadline',
                'status'
            ]);
        });
    }
};