addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  switch (request.method) {
    case 'OPTIONS':
      return new Response(200, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    case 'GET':
      const params = new URLSearchParams(request.url.slice(request.url.indexOf('?') + 1))
      // console.log('hello world', params.type)
      const response = await ZLLKV.get(params.get('type'))
      return new Response(response, {
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    case 'POST':
      const body = await request.json()
      // body.type should be genre e.g. 'restaurant'
      const currentData = await ZLLKV.get(body.type)
      let dataToSubmit = []
      if (currentData) {
        dataToSubmit = JSON.parse(currentData)
      }
      dataToSubmit.push(body)
      await ZLLKV.put(body.type, JSON.stringify(dataToSubmit))
      return new Response(201, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      })
    case 'DELETE':
        const toDelete = await request.json()
        const savedData = await ZLLKV.get(toDelete.type)
        let dataToSave = []
        if (savedData) {
          dataToSave = JSON.parse(savedData)
        }
        await ZLLKV.put(toDelete.type, JSON.stringify(dataToSave.filter((itm) => itm.name !== toDelete.name)))
        return new Response(200, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS,DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        })
    default:
      return new Response(404)
  }
}
