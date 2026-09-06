<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BadgeSeeder::class,
            TeacherSeeder::class,
            BookSeeder::class,
        ]);
    }
}
