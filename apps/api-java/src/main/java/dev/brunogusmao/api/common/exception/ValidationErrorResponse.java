package dev.brunogusmao.api.common.exception;

import java.util.List;
import java.util.Map;

/**
 * Formato equivalente ao {@code result.error.flatten()} do Zod no backend Nest:
 * erros de campo agrupados por nome, mais uma lista de erros de nível de formulário.
 */
public record ValidationErrorResponse(
        List<String> formErrors,
        Map<String, List<String>> fieldErrors
) {
}
