const express = require('express')
const app = express()
const axios = require('axios')

app.use(express.static('public'))
app.set('view engine', 'pug')

/**
 * Request latest articles from The Guardian API
 * @param page
 * @param query
 * @return promise
 */
async function getArticlesResponse(page, query) {

  const orderBy = query === ""
    ? 'newest'
    : 'relevance'

  return axios.get('https://content.guardianapis.com/search'
    + '?api-key=' + process.env.API_KEY
    + '&page=' + page
    + '&q=' + query
    + '&page-size=15'
    + '&order-by=' + orderBy)
}

/**
 * Build view model data
 * @param responseData
 * @param page
 * @param query
 * @return object
 */
function getPageData(responseData, page, query) {

  const pageData = {
    articles: responseData.response.results,
    pathToNext: '/?page=' + (page + 1) + '&q=' + query,
    query: query
  }

  if (page > 1) {
    pageData['pathToLast'] = '/?page=' + (page - 1) + '&q=' + query
  }

  return pageData;
}

/**
 * Render application using index.pug layout
 * @param req
 * @param res
 */
async function renderApplication(req, res) {

  const page = Number(req.query.page || 1)
  const query = req.query.q || ""

  try {

    const response = await getArticlesResponse(page, query)
    res.render('index', getPageData(response.data, page, query))

  } catch (err) {

    console.log(err)
    res.sendStatus(500)

  }
}

app.get('/', (req, res) => { renderApplication(req, res) })
app.listen(3000, () => console.log('listening for requests on port 3000'))
