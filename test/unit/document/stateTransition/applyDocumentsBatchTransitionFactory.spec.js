const Document = require('../../../../lib/document/Document');
const DocumentsBatchTransition = require(
  '../../../../lib/document/stateTransition/DocumentsBatchTransition',
);

const applyDocumentsBatchTransitionFactory = require(
  '../../../../lib/document/stateTransition/applyDocumentsBatchTransitionFactory',
);

const getDocumentsFixture = require('../../../../lib/test/fixtures/getDocumentsFixture');
const getDocumentTransitionsFixture = require(
  '../../../../lib/test/fixtures/getDocumentTransitionsFixture',
);

const DocumentNotProvidedError = require('../../../../lib/document/errors/DocumentNotProvidedError');

const createStateRepositoryMock = require('../../../../lib/test/mocks/createStateRepositoryMock');

describe('applyDocumentsBatchTransitionFactory', () => {
  let documents;
  let documentTransitions;
  let ownerId;
  let replaceDocument;
  let stateTransition;
  let documentsFixture;
  let applyDocumentsBatchTransition;
  let stateRepositoryMock;
  let fetchDocumentsMock;

  beforeEach(function beforeEach() {
    documentsFixture = getDocumentsFixture();

    ownerId = getDocumentsFixture.ownerId;

    replaceDocument = new Document({
      ...documentsFixture[1].toJSON(),
      lastName: 'NotSoShiny',
    });

    documents = [replaceDocument, documentsFixture[2]];

    documentTransitions = getDocumentTransitionsFixture({
      create: [documentsFixture[0]],
      replace: [documents[0]],
      delete: [documents[1]],
    });

    stateTransition = new DocumentsBatchTransition({
      ownerId,
      transitions: documentTransitions.map((t) => t.toJSON()),
    });

    stateRepositoryMock = createStateRepositoryMock(this.sinonSandbox);
    fetchDocumentsMock = this.sinonSandbox.stub();
    fetchDocumentsMock.resolves([
      replaceDocument,
    ]);

    applyDocumentsBatchTransition = applyDocumentsBatchTransitionFactory(
      stateRepositoryMock,
      fetchDocumentsMock,
    );
  });

  it('should call `store`, `replace` and `remove` functions for specific type of transitions', async () => {
    await applyDocumentsBatchTransition(stateTransition);

    const replaceDocumentTransition = documentTransitions[1];

    expect(fetchDocumentsMock).to.have.been.calledOnceWithExactly(
      [replaceDocumentTransition],
    );

    expect(stateRepositoryMock.storeDocument).to.have.been.calledTwice();
    expect(stateRepositoryMock.storeDocument.getCall(0).args).to.deep.equal([
      documentsFixture[0],
    ]);
    expect(stateRepositoryMock.storeDocument.getCall(1).args).to.deep.equal([
      documents[0],
    ]);

    expect(stateRepositoryMock.removeDocument).to.have.been.calledOnceWithExactly(
      documentTransitions[2].getDataContractId(),
      documentTransitions[2].getType(),
      documentTransitions[2].getId(),
    );
  });

  it('should throw an error if document was not provided for a replacement', async () => {
    fetchDocumentsMock.resolves([]);

    const replaceDocumentTransition = documentTransitions[1];

    try {
      await applyDocumentsBatchTransition(stateTransition);
      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(DocumentNotProvidedError);
      expect(e.getDocumentTransition()).to.deep.equal(replaceDocumentTransition);
    }
  });
});
