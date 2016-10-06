define(["require", "exports", 'datatype'], function (require, exports, datatype) {
  exports.test = function(){

    QUnit.module('datatype', function() {

      QUnit.test('Object.keys', function(assert) {
        assert.deepEqual(Object.keys(datatype).sort(), [
          "DataTypeBase",
          "assignData",
          "categorical2partitioning",
          "defineDataType",
          "isDataType",
          "mask",
          "transpose"
        ]);
      });

      QUnit.test('isDataType', function(assert) {
        assert.throws(
          function() {
            datatype.isDataType();
          }
        );
      });

      QUnit.test('isDataType one arg', function(assert) {
        assert.equal(datatype.isDataType('foo'), false);
      });

      // TODO: isDataType == true?

      QUnit.test('assignData', function(assert) {
        assert.throws( // TODO
          function() {
            datatype.assignData();
          }
        );
      });

      QUnit.test('transpose', function(assert) {
        assert.throws( // TODO
          function() {
            datatype.transpose();
          }
        );
      });

      QUnit.test('mask', function(assert) {
        assert.throws( // TODO
          function() {
            datatype.mask();
          }
        );
      });

      QUnit.test('categorical2partitioning', function(assert) {
        assert.throws( // TODO
          function() {
            datatype.categorical2partitioning();
          }
        );
      });

      QUnit.test('defineDataType', function(assert) {
        assert.equal(typeof datatype.defineDataType(), 'function');
      });

      QUnit.test('defineDataType', function(assert) {
        assert.throws( // TODO
          function() {
            (datatype.defineDataType())();
          }
        );
      });

    });

  }
});

