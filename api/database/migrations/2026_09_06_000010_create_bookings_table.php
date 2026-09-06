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
            $table->foreignId('availability_slot_id')->nullable()->constrained('availability_slots')->nullOnDelete();
            $table->string('subject');
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(45);
            $table->unsignedInteger('price_fcfa');
            $table->enum('status', ['en_attente', 'confirmee', 'annulee', 'terminee'])->default('en_attente');
            $table->enum('payment_status', ['non_paye', 'paye', 'rembourse'])->default('non_paye');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
