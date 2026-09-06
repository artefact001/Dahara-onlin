<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('teacher_profile_id')->constrained('teacher_profiles')->cascadeOnDelete();
            $table->foreignId('teacher_availability_id')->nullable()->constrained('teacher_availability')->nullOnDelete();
            $table->string('subject');
            $table->dateTime('starts_at');
            $table->unsignedInteger('duration_minutes')->default(45);
            $table->unsignedInteger('price')->default(0);
            $table->enum('status', ['en_attente', 'confirmee', 'annulee', 'terminee'])->default('en_attente');
            $table->enum('payment_status', ['non_paye', 'paye', 'rembourse'])->default('non_paye');
            // Nom de salle Jitsi, généré automatiquement à la création (voir BookingController)
            $table->string('room_name')->unique();
            $table->string('recording_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
