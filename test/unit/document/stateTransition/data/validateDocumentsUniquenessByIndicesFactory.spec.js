const verifyDocumentsUniquenessByIndicesFactory = require('../../../../../lib/document/stateTransition/validation/data/validateDocumentsUniquenessByIndicesFactory');

const getDocumentsFixture = require('../../../../../lib/test/fixtures/getDocumentsFixture');
const getContractFixture = require('../../../../../lib/test/fixtures/getDataContractFixture');
const getDocumentTransitionsFixture = require('../../../../../lib/test/fixtures/getDocumentTransitionsFixture');

const { expectValidationError } = require('../../../../../lib/test/expect/expectError');
const createStateRepositoryMock = require('../../../../../lib/test/mocks/createStateRepositoryMock');

const ValidationResult = require('../../../../../lib/validation/ValidationResult');

const DuplicateDocumentError = require('../../../../../lib/errors/DuplicateDocumentError');

describe('validateDocumentsUniquenessByIndices', () => {
  let stateRepositoryMock;
  let validateDocumentsUniquenessByIndices;
  let documents;
  let documentTransitions;
  let dataContract;
  let ownerId;

  beforeEach(function beforeEach() {
    ({ ownerId } = getDocumentsFixture);

    documents = getDocumentsFixture();
    documentTransitions = getDocumentTransitionsFixture({
      create: documents,
    });
    dataContract = getContractFixture();

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    stateRepositoryMock.fetchDocuments.resolves([]);

    validateDocumentsUniquenessByIndices = verifyDocumentsUniquenessByIndicesFactory(
      stateRepositoryMock,
    );
  });

  it('should return valid result if Documents have no unique indices');

  it('should return valid result if Document has unique indices and there are no duplicates', async () => {
    const [, , , william] = documents;

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', william.get('firstName')],
          ],
        },
      )
      .resolves([william]);

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', william.get('lastName')],
          ],
        },
      )
      .resolves([william]);

    const result = await validateDocumentsUniquenessByIndices(
      ownerId, documentTransitions, dataContract,
    );

    expect(result).to.be.an.instanceOf(ValidationResult);
    expect(result.isValid()).to.be.true();
  });

  it('should return invalid result if Document has unique indices and there are duplicates', async () => {
    const [, , , william, leon] = documents;

    const indicesDefinition = dataContract.getDocumentSchema(william.getType()).indices;

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', william.get('firstName')],
          ],
        },
      )
      .resolves([leon]);

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        william.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', william.get('lastName')],
          ],
        },
      )
      .resolves([leon]);

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        leon.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['firstName', '==', leon.get('firstName')],
          ],
        },
      )
      .resolves([william]);

    stateRepositoryMock.fetchDocuments
      .withArgs(
        dataContract.getId(),
        leon.getType(),
        {
          where: [
            ['$ownerId', '==', ownerId],
            ['lastName', '==', leon.get('lastName')],
          ],
        },
      )
      .resolves([william]);

    const result = await validateDocumentsUniquenessByIndices(
      ownerId, documentTransitions, dataContract,
    );

    expectValidationError(result, DuplicateDocumentError, 4);

    const errors = result.getErrors();

    expect(errors.map((e) => e.getDocumentTransition())).to.have.deep.members([
      documentTransitions[3],
      documentTransitions[3],
      documentTransitions[4],
      documentTransitions[4],
    ]);

    expect(errors.map((e) => e.getIndexDefinition())).to.have.deep.members([
      indicesDefinition[0],
      indicesDefinition[1],
      indicesDefinition[0],
      indicesDefinition[1],
    ]);
  });
});
