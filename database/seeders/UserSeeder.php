<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $studentRole = Role::where('name', 'Student')->first();

        User::create([
            'name' => 'John Student',
            'email' => 'student@example.com',
            'password' => 'password123',
            'role_id' => $studentRole->id,
        ]);
    }
}