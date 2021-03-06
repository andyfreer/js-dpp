const { convertSatoshiToCredits } = require('../../creditsConverter');

/**
 * @param {StateRepository} stateRepository
 * @param {fetchConfirmedAssetLockTransactionOutput} fetchConfirmedAssetLockTransactionOutput
 *
 * @returns {applyIdentityTopUpTransition}
 */
function applyIdentityTopUpTransitionFactory(
  stateRepository,
  fetchConfirmedAssetLockTransactionOutput,
) {
  /**
   * Apply identity state transition
   *
   * @typedef applyIdentityTopUpTransition
   *
   * @param {IdentityTopUpTransition} stateTransition
   *
   * @return {Promise<void>}
   */
  async function applyIdentityTopUpTransition(stateTransition) {
    const output = await fetchConfirmedAssetLockTransactionOutput(
      stateTransition.getLockedOutPoint(),
    );

    const creditsAmount = convertSatoshiToCredits(output.satoshis);

    const identityId = stateTransition.getIdentityId();

    const identity = await stateRepository.fetchIdentity(identityId);
    identity.increaseBalance(creditsAmount);

    await stateRepository.storeIdentity(identity);
  }

  return applyIdentityTopUpTransition;
}

module.exports = applyIdentityTopUpTransitionFactory;
