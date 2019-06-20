module.exports = [
    {
      params: '/:query',
      name: 'find',
      method: 'get'
    },
    {
      params: '/:key',
      name: 'distinct',
      method: 'get'
    },
    {
      params: '',
      name: 'create',
      auth: true,
      method: 'post',
      middleware : 'formidable'
    },
    {
      params: '/:id',
      name: 'del',
      auth: true,
      method: 'post'
    },
    {
      params: '/:params',
      name: 'update',
      auth: true,
      method: 'post'
    },
    {
      params: '',
      name: 'update',
      auth: true,
      method: 'post'
    },
    {
      params: '/:areaLayerId',
      name: 'updateAnalysis',
      auth: true,
      method: 'post',
      restrict: ['features']
    },
    {
      params: '',
      name: 'updateMany',
      auth: true,
      method: 'post',
      middleware : 'formidable'
    },
    {
      params: '',
      name: 'deleteMany',
      auth: true,
      method: 'post',
      middleware : ''
    }
  ]
