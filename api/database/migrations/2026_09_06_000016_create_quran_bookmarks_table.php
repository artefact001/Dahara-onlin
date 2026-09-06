<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quran_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('surah_number');
            $table->unsignedInteger('ayah_number');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'surah_number', 'ayah_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quran_bookmarks');
    }
};
