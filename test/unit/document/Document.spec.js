const rewiremock = require('rewiremock/node');

const generateRandomId = require('../../../lib/test/utils/generateRandomId');

const DocumentCreateTransition = require('../../../lib/document/stateTransition/documentTransition/DocumentCreateTransition');

describe('Document', () => {
  let lodashGetMock;
  let lodashSetMock;
  let hashMock;
  let encodeMock;
  let Document;
  let rawDocument;
  let document;

  beforeEach(function beforeEach() {
    lodashGetMock = this.sinonSandbox.stub();
    lodashSetMock = this.sinonSandbox.stub();
    hashMock = this.sinonSandbox.stub();
    const serializerMock = { encode: this.sinonSandbox.stub() };
    encodeMock = serializerMock.encode;

    Document = rewiremock.proxy('../../../lib/document/Document', {
      '../../../node_modules/lodash.get': lodashGetMock,
      '../../../node_modules/lodash.set': lodashSetMock,
      '../../../lib/util/hash': hashMock,
      '../../../lib/util/serializer': serializerMock,
    });

    rawDocument = {
      $id: 'D3AT6rBtyTqx3hXFckwtP81ncu49y5ndE7ot9JkuNSeB',
      $type: 'test',
      $dataContractId: generateRandomId(),
      $ownerId: generateRandomId(),
      $revision: DocumentCreateTransition.INITIAL_REVISION,
    };

    document = new Document(rawDocument);
  });

  describe('constructor', () => {
    beforeEach(function beforeEach() {
      Document.prototype.setData = this.sinonSandbox.stub();
    });

    it('should create Document with $id and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $id: 'id',
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.id).to.equal(rawDocument.$id);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $type and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $type: 'test',
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.type).to.equal(rawDocument.$type);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $dataContractId and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $dataContractId: generateRandomId(),
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.dataContractId).to.equal(rawDocument.$dataContractId);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $ownerId and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $ownerId: generateRandomId(),
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.ownerId).to.equal(rawDocument.$ownerId);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with undefined action and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.action).to.equal(undefined);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });

    it('should create Document with $revision and data if present', () => {
      const data = {
        test: 1,
      };

      rawDocument = {
        $revision: 'test',
        ...data,
      };

      document = new Document(rawDocument);

      expect(document.revision).to.equal(rawDocument.$revision);
      expect(Document.prototype.setData).to.have.been.calledOnceWith(data);
    });
  });

  describe('#getId', () => {
    it('should return ID', () => {
      const id = '123';

      document.id = id;

      const actualId = document.getId();

      expect(hashMock).to.have.not.been.called();

      expect(id).to.equal(actualId);
    });
  });

  describe('#getType', () => {
    it('should return $type', () => {
      expect(document.getType()).to.equal(rawDocument.$type);
    });
  });

  describe('#getOwnerId', () => {
    it('should return $ownerId', () => {
      expect(document.getOwnerId()).to.equal(rawDocument.$ownerId);
    });
  });

  describe('#getDataContractId', () => {
    it('should return $dataContractId', () => {
      expect(document.getOwnerId()).to.equal(rawDocument.$ownerId);
    });
  });

  describe('#setRevision', () => {
    it('should set $revision', () => {
      const revision = 5;

      const result = document.setRevision(revision);

      expect(result).to.equal(document);

      expect(document.revision).to.equal(revision);
    });
  });

  describe('#getRevision', () => {
    it('should return $revision', () => {
      const revision = 5;

      document.revision = revision;

      expect(document.getRevision()).to.equal(revision);
    });
  });

  describe('#setData', () => {
    beforeEach(function beforeEach() {
      Document.prototype.set = this.sinonSandbox.stub();
    });

    it('should call set for each document property', () => {
      const data = {
        test1: 1,
        test2: 2,
      };

      const result = document.setData(data);

      expect(result).to.equal(document);

      expect(Document.prototype.set).to.have.been.calledTwice();

      expect(Document.prototype.set).to.have.been.calledWith('test1', 1);
      expect(Document.prototype.set).to.have.been.calledWith('test2', 2);
    });
  });

  describe('#getData', () => {
    it('should return all data', () => {
      const data = {
        test1: 1,
        test2: 2,
      };

      document.data = data;

      expect(document.getData()).to.equal(data);
    });
  });

  describe('#set', () => {
    it('should set value for specified property name', () => {
      const path = 'test[0].$my';
      const value = 2;

      const result = document.set(path, value);

      expect(result).to.equal(document);

      expect(lodashSetMock).to.have.been.calledOnceWith(document.data, path, value);
    });
  });

  describe('#get', () => {
    it('should return value for specified property name', () => {
      const path = 'test[0].$my';
      const value = 2;

      lodashGetMock.returns(value);

      const result = document.get(path);

      expect(result).to.equal(value);

      expect(lodashGetMock).to.have.been.calledOnceWith(document.data, path);
    });
  });

  describe('#toJSON', () => {
    it('should return Document as plain JS object', () => {
      expect(document.toJSON()).to.deep.equal(rawDocument);
    });
  });

  describe('#serialize', () => {
    it('should return serialized Document', () => {
      const serializedDocument = '123';

      encodeMock.returns(serializedDocument);

      const result = document.serialize();

      expect(result).to.equal(serializedDocument);

      expect(encodeMock).to.have.been.calledOnceWith(rawDocument);
    });
  });

  describe('#hash', () => {
    beforeEach(function beforeEach() {
      Document.prototype.serialize = this.sinonSandbox.stub();
    });

    it('should return Document hash', () => {
      const serializedDocument = '123';
      const hashedDocument = '456';

      Document.prototype.serialize.returns(serializedDocument);

      hashMock.returns(hashedDocument);

      const result = document.hash();

      expect(result).to.equal(hashedDocument);

      expect(Document.prototype.serialize).to.have.been.calledOnce();

      expect(hashMock).to.have.been.calledOnceWith(serializedDocument);
    });
  });
});
