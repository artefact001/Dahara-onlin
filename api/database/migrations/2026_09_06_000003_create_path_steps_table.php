<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('path_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('path_id')->constrained('learning_paths')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('detail')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->enum('status', ['a_faire', 'en_cours', 'termine'])->default('a_faire');
            $table->date('target_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('path_steps');
    }
};
