<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('banned_at')->nullable()->after('points');
            $table->string('ban_reason')->nullable()->after('banned_at');
        });

        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            // Cible générique : un message, une réservation, un profil professeur...
            $table->string('reportable_type');
            $table->unsignedBigInteger('reportable_id');
            $table->string('reason');
            $table->text('details')->nullable();
            $table->enum('status', ['nouveau', 'traite', 'rejete'])->default('nouveau');
            $table->timestamps();
            $table->index(['reportable_type', 'reportable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['banned_at', 'ban_reason']);
        });
    }
};
