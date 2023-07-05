function routerQuery() {
  let queryStr = window.location.search.substring(1);
  let vars = queryStr.split('&');
  const query = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return query;
}

function getRandomColor() {
  function randomColor() {
    let random = Math.random();
    if (random === 0) {
      return randomColor();
    }
    return `#${random.toString(16).substring(2, 8)}`;
  }
  return randomColor();
}
export { routerQuery, getRandomColor };