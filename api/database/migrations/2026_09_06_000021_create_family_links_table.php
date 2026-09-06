<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Permet de créer un compte enfant géré directement par un parent (sans email propre).
            $table->foreignId('managed_by_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
        });

        Schema::create('family_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('child_id')->constrained('users')->cascadeOnDelete();
            $table->string('relationship')->default('enfant');
            $table->timestamps();
            $table->unique(['parent_id', 'child_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_links');
        Schema::table('users', fn (Blueprint $table) => $table->dropConstrainedForeignId('managed_by_id'));
    }
};
