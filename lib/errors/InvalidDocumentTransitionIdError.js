const ConsensusError = require('./ConsensusError');

class InvalidDocumentTransitionIdError extends ConsensusError {
  /**
   * @param {
   *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
   * } rawDocumentTransition
   */
  constructor(rawDocumentTransition) {
    super('Invalid document transition id');

    this.rawDocumentTransition = rawDocumentTransition;
  }

  /**
   * Get raw document transition
   *
   * @return {
   *   RawDocumentCreateTransition|RawDocumentReplaceTransition|RawDocumentDeleteTransition
   * }
   */
  getRawDocumentTransition() {
    return this.rawDocumentTransition;
  }
}

module.exports = InvalidDocumentTransitionIdError;
