/**
 * An error to be used when a function is in a state where
 * it is not finished.
 */
export default class NotImplementedError extends Error {
  /**
   * Creates a new instance of this class
   */
  constructor(...[message = "Not implemented"]: ConstructorParameters<typeof Error>) {
    super(message);
  }
}
