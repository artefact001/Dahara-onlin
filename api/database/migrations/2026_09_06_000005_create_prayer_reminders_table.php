<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prayer_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('prayer');
            $table->boolean('enabled')->default(true);
            $table->unsignedInteger('offset_minutes')->default(10);
            $table->string('city')->default('Dakar');
            $table->timestamps();
            $table->unique(['user_id', 'prayer']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prayer_reminders');
    }
};
