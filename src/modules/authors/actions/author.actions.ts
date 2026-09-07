"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as authorService from "../services/author.service";

export async function listAuthorsAction(query: unknown) {
  try {
    const result = await authorService.listAuthors(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getAuthorDetailAction(id: unknown) {
  try {
    const data = await authorService.getAuthorDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function createAuthorAction(input: unknown) {
  try {
    const data = await authorService.createAuthor(input);
    return success(data, "Author berhasil dibuat.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateAuthorAction(input: unknown) {
  try {
    const data = await authorService.updateAuthor(input);
    return success(data, "Author berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function deleteAuthorAction(id: unknown) {
  try {
    const data = await authorService.deleteAuthor(id);
    return success(data, "Author berhasil dihapus.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
