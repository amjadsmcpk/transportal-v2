export async function retryTransaction<T>(
  operation: () => Promise<T>,

  retries = 3,

  delay = 2000
): Promise<T> {
  let lastError: unknown;

  for (
    let i = 0;
    i < retries;
    i++
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      console.warn(
        `Retry attempt ${
          i + 1
        } failed`
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, delay)
      );
    }
  }

  throw lastError;
}