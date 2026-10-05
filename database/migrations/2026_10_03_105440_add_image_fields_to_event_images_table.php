<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_images', function (Blueprint $table) {
            $table->foreignId('event_id')
                ->after('id')
                ->constrained('events')
                ->cascadeOnDelete();

            $table->string('image')
                ->after('event_id');
        });
    }

    public function down(): void
    {
        Schema::table('event_images', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropColumn(['event_id', 'image']);
        });
    }
};