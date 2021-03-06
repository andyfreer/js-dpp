/**
 * @param sinonSandbox
 * @return {{
 *   fetchDataContract: *,
 *   storeDataContract: *,
 *   fetchDocuments: *,
 *   storeDocument: *,
 *   removeDocument: *,
 *   fetchTransaction: *,
 *   fetchIdentity: *,
 *   storeIdentity: *,
 *   storePublicKeyIdentityId: *,
 *   fetchPublicKeyIdentityId: *,
 * }}
 */
module.exports = function createStateRepositoryMock(sinonSandbox) {
  return {
    fetchDataContract: sinonSandbox.stub(),
    storeDataContract: sinonSandbox.stub(),
    fetchDocuments: sinonSandbox.stub(),
    storeDocument: sinonSandbox.stub(),
    removeDocument: sinonSandbox.stub(),
    fetchTransaction: sinonSandbox.stub(),
    fetchIdentity: sinonSandbox.stub(),
    storeIdentity: sinonSandbox.stub(),
    storePublicKeyIdentityId: sinonSandbox.stub(),
    fetchPublicKeyIdentityId: sinonSandbox.stub(),
  };
};
