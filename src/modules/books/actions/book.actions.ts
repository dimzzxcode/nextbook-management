"use server";

import { toErrorResponse } from "@/shared/errors";
import { success } from "@/shared/utils/response";
import * as bookService from "../services/book.service";

export async function listBooksAction(query: unknown) {
  try {
    const result = await bookService.listBooks(query);
    return success(result);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function getBookDetailAction(id: unknown) {
  try {
    const data = await bookService.getBookDetail(id);
    return success(data);
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function createBookAction(input: unknown) {
  try {
    const data = await bookService.createBook(input);
    return success(data, "Buku berhasil dibuat.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function updateBookAction(input: unknown) {
  try {
    const data = await bookService.updateBook(input);
    return success(data, "Buku berhasil diperbarui.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function deleteBookAction(id: unknown) {
  try {
    const data = await bookService.deleteBook(id);
    return success(data, "Buku berhasil dihapus.");
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function restoreBookAction(id: unknown) {
  try {
    const data = await bookService.restoreBook(id);
    return success(data, "Buku berhasil dipulihkan.");
  } catch (err) {
    return toErrorResponse(err);
  }
}
