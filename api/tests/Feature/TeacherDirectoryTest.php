<?php

namespace Tests\Feature;

use App\Models\TeacherProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherDirectoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_verified_teachers_are_publicly_listed(): void
    {
        TeacherProfile::factory()->create(['status' => 'valide', 'full_name' => 'Visible']);
        TeacherProfile::factory()->create(['status' => 'en_attente', 'full_name' => 'Invisible']);

        $response = $this->getJson('/api/teachers')->assertOk();

        $names = collect($response->json('data'))->pluck('full_name');
        $this->assertContains('Visible', $names);
        $this->assertNotContains('Invisible', $names);
    }

    public function test_can_filter_teachers_by_subject(): void
    {
        TeacherProfile::factory()->create(['status' => 'valide', 'subjects' => ['Fiqh']]);
        TeacherProfile::factory()->create(['status' => 'valide', 'subjects' => ['Coran', 'Tajwid']]);

        $response = $this->getJson('/api/teachers?subject=Fiqh')->assertOk();

        $this->assertCount(1, $response->json('data'));
    }
}
