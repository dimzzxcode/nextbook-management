"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as categoryService from "../services/category.service";

export async function listCategoriesAction(query: unknown) {
  try {
    const result = await categoryService.listCategories(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getCategoryDetailAction(id: unknown) {
  try {
    const data = await categoryService.getCategoryDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function createCategoryAction(input: unknown) {
  try {
    const data = await categoryService.createCategory(input);
    return success(data, "Kategori berhasil dibuat.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateCategoryAction(input: unknown) {
  try {
    const data = await categoryService.updateCategory(input);
    return success(data, "Kategori berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function deleteCategoryAction(id: unknown) {
  try {
    const data = await categoryService.deleteCategory(id);
    return success(data, "Kategori berhasil dihapus.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
