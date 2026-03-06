// ----------------------------------------------------------------------

export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message || error.name || '오류가 발생했습니다.';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorMessage = error.message;
    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  return `알 수 없는 오류가 발생했습니다: ${error}`;
}
