<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Display all categories.
     */
    public function index()
    {
        $categories = Category::all();

        return response()->json([
            'message' => 'Categories retrieved successfully.',
            'categories' => $categories
        ], 200);
    }

    /**
     * Store a new category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'category' => $category
        ], 201);
    }

    /**
     * Display a single category.
     */
    public function show(Category $category)
    {
        return response()->json([
            'message' => 'Category retrieved successfully.',
            'category' => $category
        ], 200);
    }

    /**
     * Update a category.
     */
    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'category' => $category
        ], 200);
    }

    /**
     * Delete a category.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.'
        ], 200);
    }
}