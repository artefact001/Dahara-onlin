<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChildSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_managed_child_cannot_start_a_conversation_with_a_stranger(): void
    {
        $parent = User::factory()->create();
        $child = User::factory()->create(['managed_by_id' => $parent->id]);
        $stranger = User::factory()->create();

        $this->actingAs($child)->postJson('/api/conversations', ['user_id' => $stranger->id])
            ->assertStatus(403);
    }

    public function test_a_managed_child_can_message_their_own_parent(): void
    {
        $parent = User::factory()->create();
        $child = User::factory()->create(['managed_by_id' => $parent->id]);

        $this->actingAs($child)->postJson('/api/conversations', ['user_id' => $parent->id])
            ->assertCreated();
    }

    public function test_a_stranger_cannot_start_a_conversation_with_someone_elses_child(): void
    {
        $parent = User::factory()->create();
        $child = User::factory()->create(['managed_by_id' => $parent->id]);
        $stranger = User::factory()->create();

        $this->actingAs($stranger)->postJson('/api/conversations', ['user_id' => $child->id])
            ->assertStatus(403);
    }

    public function test_parent_can_read_their_childs_messages(): void
    {
        $parent = User::factory()->create();
        $child = User::factory()->create(['managed_by_id' => $parent->id]);

        $this->actingAs($child)->postJson('/api/conversations', ['user_id' => $parent->id])->assertCreated();

        $this->actingAs($parent)->getJson("/api/family/children/{$child->id}/messages")->assertOk();
    }

    public function test_unrelated_parent_cannot_read_someone_elses_child_messages(): void
    {
        $parent = User::factory()->create();
        $child = User::factory()->create(['managed_by_id' => $parent->id]);
        $unrelatedParent = User::factory()->create();

        $this->actingAs($unrelatedParent)->getJson("/api/family/children/{$child->id}/messages")
            ->assertStatus(403);
    }

    public function test_a_banned_user_cannot_use_the_api(): void
    {
        $user = User::factory()->create(['banned_at' => now()]);

        $this->actingAs($user)->getJson('/api/profile')->assertStatus(403);
    }
}
