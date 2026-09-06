<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('slug')->unique();
            $table->json('subjects');           // ["Arabe", "Coran", "Tajwid"]
            $table->json('tags')->nullable();
            $table->string('city')->default('Dakar');
            $table->unsignedInteger('price_fcfa')->default(5000);
            $table->unsignedInteger('session_minutes')->default(45);
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->json('languages')->nullable();
            $table->json('levels')->nullable(); // ["Débutant", "Intermédiaire"]
            $table->text('bio')->nullable();
            $table->string('photo_path')->nullable();
            $table->enum('verification_status', ['en_attente', 'verifie', 'refuse'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_profiles');
    }
};
