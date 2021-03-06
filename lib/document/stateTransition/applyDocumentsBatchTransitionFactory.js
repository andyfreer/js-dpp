const AbstractDocumentTransition = require(
  './documentTransition/AbstractDocumentTransition',
);
const DocumentCreateTransition = require('./documentTransition/DocumentCreateTransition');

const InvalidDocumentActionError = require('../errors/InvalidDocumentActionError');
const DocumentNotProvidedError = require('../errors/DocumentNotProvidedError');

const Document = require('../Document');

/**
 * @param {StateRepository} stateRepository
 * @param {fetchDocuments} fetchDocuments
 *
 * @returns {applyDocumentsBatchTransition}
 */
function applyDocumentsBatchTransitionFactory(
  stateRepository,
  fetchDocuments,
) {
  /**
   * Apply documents batch state transition
   *
   * @typedef applyDocumentsBatchTransition
   *
   * @param {DocumentsBatchTransition} stateTransition
   *
   * @return {Promise<*>}
   */
  async function applyDocumentsBatchTransition(stateTransition) {
    // Fetch documents for replace transitions
    const replaceTransitions = stateTransition.getTransitions()
      .filter((dt) => dt.getAction() === AbstractDocumentTransition.ACTIONS.REPLACE);

    const fetchedDocuments = await fetchDocuments(replaceTransitions);

    const fetchedDocumentsById = fetchedDocuments.reduce((result, document) => (
      {
        ...result,
        [document.getId()]: document,
      }
    ), {});

    return Promise.all(stateTransition.getTransitions().map(async (documentTransition) => {
      const documentId = documentTransition.getId();

      switch (documentTransition.getAction()) {
        case AbstractDocumentTransition.ACTIONS.CREATE: {
          const newDocument = new Document({
            $id: documentTransition.getId(),
            $type: documentTransition.getType(),
            $dataContractId: documentTransition.getDataContractId(),
            $ownerId: stateTransition.getOwnerId(),
            ...documentTransition.getData(),
          });

          newDocument.setEntropy(documentTransition.getEntropy());
          newDocument.setRevision(DocumentCreateTransition.INITIAL_REVISION);

          return stateRepository.storeDocument(newDocument);
        }
        case AbstractDocumentTransition.ACTIONS.REPLACE: {
          const document = fetchedDocumentsById[documentId];

          if (!document) {
            throw new DocumentNotProvidedError(documentTransition);
          }

          document.setRevision(documentTransition.getRevision());
          document.setData(documentTransition.getData());

          return stateRepository.storeDocument(document);
        }
        case AbstractDocumentTransition.ACTIONS.DELETE: {
          return stateRepository.removeDocument(
            documentTransition.getDataContractId(),
            documentTransition.getType(),
            documentId,
          );
        }
        default:
          throw new InvalidDocumentActionError(documentTransition);
      }
    }));
  }

  return applyDocumentsBatchTransition;
}

module.exports = applyDocumentsBatchTransitionFactory;
