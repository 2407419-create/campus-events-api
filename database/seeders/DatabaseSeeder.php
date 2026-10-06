<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
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

        // Student
        User::create([
            'name' => 'John Student',
            'email' => 'student@example.com',
            'password' => Hash::make('password123'),
            'role_id' => 1,
        ]);

        // Event Organizer
        User::create([
            'name' => 'Event Organizer',
            'email' => 'organizer@example.com',
            'password' => Hash::make('Organizer@123'),
            'role_id' => 2,
        ]);
    }
}