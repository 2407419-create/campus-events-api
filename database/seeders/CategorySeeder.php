<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Seed the categories table.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Academic',
                'description' => 'Academic and educational events.',
            ],
            [
                'name' => 'Sports',
                'description' => 'Sports and recreational activities.',
            ],
            [
                'name' => 'Career',
                'description' => 'Career development and employment events.',
            ],
            [
                'name' => 'Conference',
                'description' => 'Conferences, symposiums and academic forums.',
            ],
            [
                'name' => 'Workshop',
                'description' => 'Practical training and skills development workshops.',
            ],
            [
                'name' => 'Club Activities',
                'description' => 'Student club and society activities.',
            ],
            [
                'name' => 'Community Outreach',
                'description' => 'Community service and outreach activities.',
            ],
            [
                'name' => 'Entertainment',
                'description' => 'Entertainment, cultural and social events.',
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}