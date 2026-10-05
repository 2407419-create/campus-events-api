<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'Student',
            'description' => 'Regular student user',
        ]);

        Role::create([
            'name' => 'Event Organizer',
            'description' => 'User who creates and manages events',
        ]);

        Role::create([
            'name' => 'Administrator',
            'description' => 'User who manages the entire system',
        ]);
    }
}