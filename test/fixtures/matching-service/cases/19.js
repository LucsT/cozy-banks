module.exports = {
  description: 'bill with own date deltas',
  bills: [
    {
      _id: 'b1',
      amount: 30,
      date: '2019-07-31T00:00:00.000Z',
      vendor: 'sosh',
      matchingCriterias: {
        dateLowerDelta: 30
      }
    },
    {
      _id: 'b2',
      amount: 50,
      date: '2019-08-01T00:00:00.000Z',
      vendor: 'sfr',
      matchingCriterias: {
        dateUpperDelta: 40
      }
    }
  ],
  operations: [
    {
      _id: 'op1',
      date: '2019-07-01T12:00:00.000Z',
      label: 'SOSH',
      amount: -30
    },
    {
      _id: 'op2',
      date: '2019-09-01T12:00:00.000Z',
      label: 'SFR',
      amount: -50
    }
  ],
  expectedResult: {
    b1: {
      debitOperation: 'op1',
      creditOperation: undefined
    },
    b2: {
      debitOperation: 'op2',
      creditOperation: undefined
    }
  }
}
